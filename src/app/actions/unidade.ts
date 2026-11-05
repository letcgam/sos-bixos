'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/auth';
import { isStaffRole } from '@/lib/profile-role';
import {
    deleteUnidadeImage,
    getUnidadeEditor,
    updateUnidadeForUser,
    uploadUnidadeImage,
} from '@/lib/supabase-admin';

export type UpdateUnidadeState = { error: string } | null;

const ESTADOS_BRASILEIROS = new Set([
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
]);

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
    const removerLogo = getTextField(formData, 'removerLogo') === 'true';
    const logoValue = formData.get('logo');

    if (
        nome === null
        || cidade === null
        || estado === null
        || endereco === null
        || !(logoValue instanceof File)
    ) {
        return { error: 'Confira os dados informados e tente novamente.' };
    }

    if (!nome || nome.length > 200 || cidade.length > 150 || endereco.length > 1000) {
        return { error: 'Confira o nome, a cidade, o estado e o endereço informados.' };
    }

    if (estado && !ESTADOS_BRASILEIROS.has(estado)) {
        return { error: 'Selecione uma sigla válida para o estado.' };
    }

    const currentUnit = await getUnidadeEditor(user.id);
    if (!currentUnit.data) {
        return { error: currentUnit.error };
    }

    let logoUrl: string | undefined = removerLogo ? '' : undefined;
    if (logoValue.size > 0) {
        const upload = await uploadUnidadeImage(currentUnit.data.id, logoValue);
        if (upload.url === null) {
            return { error: upload.error };
        }
        logoUrl = upload.url;
    }

    const result = await updateUnidadeForUser(user.id, {
        nome,
        cidade,
        estado,
        endereco,
        ...(logoUrl !== undefined ? { logoUrl } : {}),
    });

    if (result.error) {
        if (logoUrl && logoUrl !== currentUnit.data.logoUrl) {
            await deleteUnidadeImage(logoUrl, currentUnit.data.id);
        }
        return { error: result.error };
    }

    if (logoUrl !== undefined && currentUnit.data.logoUrl) {
        await deleteUnidadeImage(currentUnit.data.logoUrl, currentUnit.data.id);
    }

    revalidatePath('/instituicao');
    revalidatePath('/painel');
    redirect('/instituicao');
}
