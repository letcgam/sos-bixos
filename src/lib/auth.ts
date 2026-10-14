import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export type StaffRole = 'admin' | 'moderator';

export function isStaffRole(role: unknown): role is StaffRole {
    return role === 'admin' || role === 'moderator';
}

export async function requireAuthenticatedUser() {
    const supabase = createClient(await cookies());
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return {
        id: user.id,
        email: user.email ?? '',
        role: user.app_metadata?.role,
    };
}

export async function requireStaff() {
    const user = await requireAuthenticatedUser();
    const role = user.role;

    if (!isStaffRole(role)) {
        redirect('/painel/perfil');
    }

    return {
        id: user.id,
        email: user.email,
        role,
    };
}