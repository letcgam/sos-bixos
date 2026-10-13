import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export type StaffRole = 'admin' | 'moderator';

export function isStaffRole(role: unknown): role is StaffRole {
    return role === 'admin' || role === 'moderator';
}

export async function requireStaff() {
    const supabase = createClient(await cookies());
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    const role = user.app_metadata?.role;

    if (!isStaffRole(role)) {
        await supabase.auth.signOut();
        redirect('/login?error=unauthorized');
    }

    return {
        id: user.id,
        email: user.email ?? '',
        role,
    };
}