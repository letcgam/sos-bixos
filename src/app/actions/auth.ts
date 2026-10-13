'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isStaffRole } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';

export type LoginState = { error: string } | null;

export async function signInAction(
    _previousState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        return { error: 'Informe seu e-mail e sua senha.' };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        return { error: 'O login ainda não está configurado. Configure as variáveis do Supabase.' };
    }

    const supabase = createClient(await cookies());
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (error || !data.user) {
        return { error: 'E-mail ou senha inválidos.' };
    }

    if (!isStaffRole(data.user.app_metadata?.role)) {
        await supabase.auth.signOut();
        return { error: 'Esta conta não tem acesso ao painel da equipe.' };
    }

    redirect('/');
}

export async function signOutAction() {
    const supabase = createClient(await cookies());
    await supabase.auth.signOut();
    redirect('/');
}