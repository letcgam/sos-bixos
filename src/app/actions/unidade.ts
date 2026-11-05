'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/auth';
import { isStaffRole } from '@/lib/profile-role';
import { updateUnidadeForUser } from '@/lib/supabase-admin';

export type UpdateUnidadeState = { error: string } | null;

function getTextField(formData: FormData, name: string): string | null {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : null;
}

export async function updateUnidadeAction(
    _previousState: UpdateUnidadeState,
    formData: FormData,
): Promise<UpdateUnidadeState> {
    const user = await requireAuthenticatedUser();
    if (!isStaffRole(user.funcao)) {
        redirect('/instituicao');
    }

    const nome = getTextField(formData, 'nome');
    const cidade = getTextField(formData, 'cidade');
    const estado = getTextField(formData, 'estado');
    const endereco = getTextField(formData, 'endereco');
    const logoUrlValue = getTextField(formData, 'logoUrl');

    if (
        nome === null
        || cidade === null
        || estado === null
        || endereco === null
        || logoUrlValue === null
    ) {
        return { error: 'Confira os dados informados e tente novamente.' };
    }

    if (!nome || nome.length > 200 || cidade.length > 150 || estado.length > 100 || endereco.length > 1000) {
        return { error: 'Confira o nome, a cidade, o estado e o endereço informados.' };
    }

    if (logoUrlValue.length > 2048) {
        return { error: 'O endereço do logo deve ter no máximo 2048 caracteres.' };
    }

    const logoUrl = logoUrlValue
        ? (() => {
            try {
                const url = new URL(logoUrlValue);
                return url.protocol === 'http:' || url.protocol === 'https:' ? logoUrlValue : null;
            } catch {
                return null;
            }
        })()
        : '';
    if (logoUrl === null) {
        return { error: 'Informe um endereço válido para o logo, começando com http:// ou https://.' };
    }

    const result = await updateUnidadeForUser(user.id, {
        nome,
        cidade,
        estado,
        endereco,
        logoUrl,
    });

    if (result.error) {
        return { error: result.error };
    }

    revalidatePath('/instituicao');
    revalidatePath('/painel');
    redirect('/instituicao');
}
