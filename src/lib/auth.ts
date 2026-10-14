import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfileFunction } from '@/lib/supabase-admin';

export async function requireAuthenticatedUser() {
    const supabase = createClient(await cookies());
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    const { funcao, error: profileError } = await getProfileFunction(user.id);
    if (profileError) {
        console.error('Failed to authorize authenticated user from perfil.funcao:', profileError);
        redirect('/login?error=profile');
    }

    return {
        id: user.id,
        email: user.email ?? '',
        funcao: funcao,
    };
}
