'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import {
    deleteStaffProfilePhoto,
    updateStaffProfile,
    uploadStaffProfilePhoto,
} from '@/lib/supabase-admin';

export type UpdateProfileState = { error: string } | null;

function getTextField(formData: FormData, name: string): string | null {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : null;
}

function getPositiveInteger(value: string | null): number | null {
    if (!value || !/^\d+$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function updateProfileAction(
    _previousState: UpdateProfileState,
    formData: FormData,
): Promise<UpdateProfileState> {
    const staff = await requireStaff();

    const nome = getTextField(formData, 'nome');
    const sobrenome = getTextField(formData, 'sobrenome');
    const ra = getTextField(formData, 'ra');
    const photoValue = formData.get('fotoPerfil');
    const removerFotoPerfil = getTextField(formData, 'removerFotoPerfil') === 'true';
    const campusId = getPositiveInteger(getTextField(formData, 'campusId'));
    const cursoId = getPositiveInteger(getTextField(formData, 'cursoId'));
    const anoIngresso = getPositiveInteger(getTextField(formData, 'anoIngresso'));
    const semestreValue = getTextField(formData, 'semestreIngresso');
    const semestreIngresso = semestreValue ? getPositiveInteger(semestreValue) : null;

    if (!nome || nome.length > 200) {
        return { error: 'Informe um nome com até 200 caracteres.' };
    }

    if (
        (sobrenome?.length ?? 0) > 200
        || (ra?.length ?? 0) > 100
    ) {
        return { error: 'Um ou mais campos excedem o limite permitido.' };
    }

    const currentYear = new Date().getFullYear();
    if (!campusId || !cursoId || !anoIngresso || anoIngresso < 1900 || anoIngresso > currentYear + 10) {
        return { error: 'Confira o campus, curso e ano de ingresso informados.' };
    }

    if (semestreValue && semestreIngresso !== 1 && semestreIngresso !== 2) {
        return { error: 'O semestre de ingresso deve ser 1 ou 2.' };
    }

    let uploadedPhotoPath: string | undefined;
    if (photoValue !== null && !(photoValue instanceof File)) {
        return { error: 'Selecione um arquivo de imagem válido.' };
    }

    if (!removerFotoPerfil && photoValue instanceof File && photoValue.name) {
        if (photoValue.size === 0 || photoValue.size > 10 * 1024 * 1024) {
            return { error: 'A imagem deve ter tamanho maior que 0 e até 10 MB.' };
        }

        const uploadResult = await uploadStaffProfilePhoto(staff.id, photoValue);
        if (uploadResult.path === null) {
            return { error: uploadResult.error ?? 'Não foi possível enviar a foto.' };
        }
        uploadedPhotoPath = uploadResult.path;
    }

    const result = await updateStaffProfile(staff.id, {
        nome,
        sobrenome: sobrenome || null,
        ra: ra || null,
        ...(uploadedPhotoPath
            ? { fotoPerfilUrl: uploadedPhotoPath }
            : removerFotoPerfil
                ? { fotoPerfilUrl: null }
                : {}),
        campusId,
        cursoId,
        anoIngresso,
        semestreIngresso,
    });

    if (result.error) {
        if (uploadedPhotoPath) {
            await deleteStaffProfilePhoto(uploadedPhotoPath);
        }
        return { error: result.error };
    }

    revalidatePath('/painel');
    revalidatePath('/painel/perfil');
    redirect('/painel');
}
