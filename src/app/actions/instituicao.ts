'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/auth';
import { updateInstituicaoForUser } from '@/lib/supabase-admin';

export type UpdateInstituicaoState = { error: string } | null;

function getTextField(formData: FormData, name: string): string | null {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : null;
}

function getOptionalHttpUrl(value: string): string | null | undefined {
    if (!value) return null;

    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
        return value;
    } catch {
        return undefined;
    }
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
    const logoUrlValue = getTextField(formData, 'logoUrl');
    const bannerUrlValue = getTextField(formData, 'bannerUrl');
    const siteOficialValue = getTextField(formData, 'siteOficial');

    if (
        nome === null
        || sigla === null
        || logoUrlValue === null
        || bannerUrlValue === null
        || siteOficialValue === null
    ) {
        return { error: 'Confira os dados informados e tente novamente.' };
    }

    if (!nome || nome.length > 200 || sigla.length > 50) {
        return { error: 'Informe um nome com até 200 caracteres e uma sigla com até 50 caracteres.' };
    }

    if ([logoUrlValue, bannerUrlValue, siteOficialValue].some((value) => value.length > 2048)) {
        return { error: 'Os endereços informados devem ter no máximo 2048 caracteres.' };
    }

    const logoUrl = getOptionalHttpUrl(logoUrlValue);
    const bannerUrl = getOptionalHttpUrl(bannerUrlValue);
    const siteOficial = getOptionalHttpUrl(siteOficialValue);
    if (logoUrl === undefined || bannerUrl === undefined || siteOficial === undefined) {
        return { error: 'Informe endereços válidos começando com http:// ou https://.' };
    }

    const result = await updateInstituicaoForUser(user.id, {
        nome,
        sigla: sigla || '',
        logoUrl: logoUrl || '',
        bannerUrl: bannerUrl || '',
        siteOficial: siteOficial || '',
    });

    if (result.error) {
        return { error: result.error };
    }

    revalidatePath('/instituicao');
    revalidatePath('/painel');
    redirect('/instituicao');
}
