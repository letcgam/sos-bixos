'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/auth';
import {
    deleteInstituicaoImage,
    getInstituicaoEditor,
    updateInstituicaoForUser,
    uploadInstituicaoImage,
} from '@/lib/supabase-admin';

export type UpdateInstituicaoState = { error: string } | null;

function getTextField(formData: FormData, name: string): string | null {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : null;
}

export async function updateInstituicaoAction(
    _previousState: UpdateInstituicaoState,
    formData: FormData,
): Promise<UpdateInstituicaoState> {
    const user = await requireAuthenticatedUser();
    if (user.funcao !== 'administrador') {
        redirect('/instituicao');
    }

    const nome = getTextField(formData, 'nome');
    const sigla = getTextField(formData, 'sigla');
    const siteOficialValue = getTextField(formData, 'siteOficial');
    const removerLogo = getTextField(formData, 'removerLogo') === 'true';
    const removerBanner = getTextField(formData, 'removerBanner') === 'true';
    const logoValue = formData.get('logo');
    const bannerValue = formData.get('banner');

    if (
        nome === null
        || sigla === null
        || siteOficialValue === null
        || !(logoValue instanceof File)
        || !(bannerValue instanceof File)
    ) {
        return { error: 'Confira os dados informados e tente novamente.' };
    }

    if (!nome || nome.length > 200 || sigla.length > 50) {
        return { error: 'Informe um nome com até 200 caracteres e uma sigla com até 50 caracteres.' };
    }

    if (siteOficialValue.length > 2048) {
        return { error: 'O endereço do site deve ter no máximo 2048 caracteres.' };
    }

    const siteOficial = siteOficialValue
        ? (() => {
            try {
                const url = new URL(siteOficialValue);
                return url.protocol === 'http:' || url.protocol === 'https:' ? siteOficialValue : null;
            } catch {
                return null;
            }
        })()
        : '';
    if (siteOficial === null) {
        return { error: 'Informe um endereço válido para o site, começando com http:// ou https://.' };
    }

    const logoFile = logoValue.size > 0 ? logoValue : null;
    const bannerFile = bannerValue.size > 0 ? bannerValue : null;
    const currentInstitution = await getInstituicaoEditor(user.id);
    if (!currentInstitution.data) {
        return { error: currentInstitution.error };
    }

    let logoUrl: string | undefined = removerLogo ? '' : undefined;
    let bannerUrl: string | undefined = removerBanner ? '' : undefined;

    if (logoFile) {
        const upload = await uploadInstituicaoImage(currentInstitution.data.id, logoFile, 'logo');
        if (upload.url === null) {
            return { error: upload.error };
        }
        logoUrl = upload.url;
    }

    if (bannerFile) {
        const upload = await uploadInstituicaoImage(currentInstitution.data.id, bannerFile, 'banner');
        if (upload.url === null) {
            if (logoUrl && logoUrl !== currentInstitution.data.logoUrl) {
                await deleteInstituicaoImage(logoUrl, currentInstitution.data.id);
            }
            return { error: upload.error };
        }
        bannerUrl = upload.url;
    }

    const result = await updateInstituicaoForUser(user.id, {
        nome,
        sigla: sigla || '',
        siteOficial,
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
    });

    if (result.error) {
        if (logoUrl && logoUrl !== currentInstitution.data.logoUrl) {
            await deleteInstituicaoImage(logoUrl, currentInstitution.data.id);
        }
        if (bannerUrl && bannerUrl !== currentInstitution.data.bannerUrl) {
            await deleteInstituicaoImage(bannerUrl, currentInstitution.data.id);
        }
        return { error: result.error };
    }

    if (logoUrl !== undefined && currentInstitution.data.logoUrl) {
        await deleteInstituicaoImage(currentInstitution.data.logoUrl, currentInstitution.data.id);
    }
    if (bannerUrl !== undefined && currentInstitution.data.bannerUrl) {
        await deleteInstituicaoImage(currentInstitution.data.bannerUrl, currentInstitution.data.id);
    }

    revalidatePath('/instituicao');
    revalidatePath('/painel');
    redirect('/instituicao');
}
