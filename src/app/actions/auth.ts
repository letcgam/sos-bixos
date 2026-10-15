'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AuthError } from '@supabase/supabase-js';
import { createProfile, deleteAuthUser } from '@/lib/supabase-admin';

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

    redirect('/painel');
}

export type SignUpState = { error?: string; success?: string } | null;

function getSignupText(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
}

function parseSignupInteger(value: string): number | null {
    if (!/^\d+$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function getSignupSupabaseError(error:AuthError | null = null) {
    switch (error?.code) {
        case 'email_address_invalid':
        case 'validation_failed':
            return 'O formato do e-mail digitado é inválido. Verifique se digitou corretamente.';

        case 'user_already_exists':
            return 'Este e-mail já está cadastrado. Tente fazer login.';

        case 'weak_password':
            return 'A senha escolhida é muito fraca. Use pelo menos 8 caracteres com letras e números.';

        case 'over_email_send_rate_limit':
            return 'Muitas tentativas recentes. Aguarde alguns minutos antes de tentar novamente.';

        default:
            if (error?.message?.includes('is invalid')) {
                return 'O endereço de e-mail informado não é válido.';
            }
            return 'Ocorreu um erro inesperado durante o cadastro. Confira os dados e tente novamente.';
    }
};

export async function signUpAction(
    _previousState: SignUpState,
    formData: FormData,
): Promise<SignUpState> {
    const nome = getSignupText(formData, 'nome');
    const sobrenome = getSignupText(formData, 'sobrenome');
    const email = getSignupText(formData, 'email').toLowerCase();
    const password = formData.get('password');
    const passwordConfirmation = formData.get('passwordConfirmation');
    const instituicaoId = parseSignupInteger(getSignupText(formData, 'instituicaoId'));
    const unidadeId = parseSignupInteger(getSignupText(formData, 'unidadeId'));
    const cursoId = parseSignupInteger(getSignupText(formData, 'cursoId'));
    const anoIngresso = parseSignupInteger(getSignupText(formData, 'anoIngresso'));
    const semestreValue = getSignupText(formData, 'semestreIngresso');
    const semestreIngresso = semestreValue
        ? parseSignupInteger(semestreValue)
        : null;

    if (
        !nome
        || nome.length > 200
        || sobrenome.length > 200
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return { error: 'Confira seu nome e informe um e-mail válido.' };
    }

    if (
        typeof password !== 'string'
        || typeof passwordConfirmation !== 'string'
        || password.length < 8
    ) {
        return { error: 'A senha deve ter pelo menos 8 caracteres.' };
    }

    if (password !== passwordConfirmation) {
        return { error: 'As senhas não coincidem.' };
    }

    const currentYear = new Date().getFullYear();
    if (
        !instituicaoId
        || !unidadeId
        || !cursoId
        || !anoIngresso
        || anoIngresso < 1900
        || anoIngresso > currentYear + 10
    ) {
        return { error: 'Confira o unidade, curso e ano de ingresso informados.' };
    }

    if (semestreValue && semestreIngresso !== 1 && semestreIngresso !== 2) {
        return { error: 'O semestre de ingresso deve ser 1 ou 2.' };
    }

    if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL
        || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        || !process.env.SUPABASE_SECRET_KEY
    ) {
        return { error: 'O cadastro ainda não está configurado no servidor.' };
    }

    const supabase = createClient(await cookies());
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: [nome, sobrenome].filter(Boolean).join(' '),
            },
        },
    });

    if (error || !data.user) {
        console.error('Student signup failed:', error);
        return { error: getSignupSupabaseError(error) };
    }

    if (data.user.identities?.length === 0) {
        return {
            success: 'Se este e-mail puder ser cadastrado, você receberá uma mensagem de confirmação.',
        };
    }

    const profileResult = await createProfile(data.user.id, {
        nome,
        sobrenome,
        instituicaoId,
        unidadeId,
        cursoId,
        anoIngresso,
        semestreIngresso,
    });

    if (profileResult.error) {
        await deleteAuthUser(data.user.id);
        if (data.session) {
            await supabase.auth.signOut();
        }
        return { error: profileResult.error };
    }

    if (data.session) {
        redirect('/painel');
    }

    return {
        success: 'Cadastro criado. Confira seu e-mail para confirmar a conta e fazer login.',
    };
}

export async function signOutAction() {
    const supabase = createClient(await cookies());
    await supabase.auth.signOut();
    redirect('/');
}