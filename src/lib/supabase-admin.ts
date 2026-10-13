import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { isStaffRole, type StaffRole } from '@/lib/auth';

export type ActiveAuthUser = {
    id: string;
    email: string;
    name: string;
    role: StaffRole;
    createdAt: string;
    lastSignInAt: string | null;
};

export type StaffProfileSummary = {
    nome: string | null;
    campus: {
        nome: string | null;
        cidade: string | null;
        estado: string | null;
        endereco: string | null;
        logo_url: string | null;
        universidade: {
            nome: string | null;
            sigla: string | null;
            logo_url: string | null;
        } | null;
    } | null;
    universidade: {
        nome: string | null;
        sigla: string | null;
        logo_url: string | null;
    } | null;
};

const USERS_PER_PAGE = 1000;

function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) return null;

    return createClient(supabaseUrl, secretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export async function getStaffProfileSummary(
    userId: string,
): Promise<StaffProfileSummary | null> {
    const supabase = createAdminClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('perfil')
        .select(`
            nome,
            campus:campi!aluno_campi_id_fkey (
                nome,
                cidade,
                estado,
                endereco,
                logo_url,
                universidade:universidade!campi_universidade_id_fkey (
                    nome,
                    sigla,
                    logo_url
                )
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (error || !data) return null;

    const rawCampus = Array.isArray(data.campus) ? data.campus[0] ?? null : data.campus ?? null;
    const campus = rawCampus
        ? {
            nome: typeof rawCampus.nome === 'string' ? rawCampus.nome : null,
            cidade: typeof rawCampus.cidade === 'string' ? rawCampus.cidade : null,
            estado: typeof rawCampus.estado === 'string' ? rawCampus.estado : null,
            endereco: typeof rawCampus.endereco === 'string' ? rawCampus.endereco : null,
            logo_url: typeof rawCampus.logo_url === 'string' ? rawCampus.logo_url : null,
            universidade: (() => {
                const rawUniversidade = Array.isArray(rawCampus.universidade)
                    ? rawCampus.universidade[0] ?? null
                    : rawCampus.universidade ?? null;

                return rawUniversidade
                    ? {
                        nome: typeof rawUniversidade.nome === 'string' ? rawUniversidade.nome : null,
                        sigla: typeof rawUniversidade.sigla === 'string' ? rawUniversidade.sigla : null,
                        logo_url: typeof rawUniversidade.logo_url === 'string' ? rawUniversidade.logo_url : null,
                    }
                    : null;
            })(),
        }
        : null;

    const universidade = campus?.universidade ?? null;

    return {
        nome: typeof data.nome === 'string' ? data.nome : null,
        campus,
        universidade,
    };
}

export async function listActiveAuthUsers(): Promise<{
    users: ActiveAuthUser[];
    error: string | null;
}> {
    const supabase = createAdminClient();

    if (!supabase) {
        return {
            users: [],
            error: 'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente do servidor.',
        };
    }

    const users: ActiveAuthUser[] = [];

    for (let page = 1; ; page += 1) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: USERS_PER_PAGE,
        });

        if (error) {
            return {
                users: [],
                error: 'Não foi possível carregar as contas. Verifique a chave secreta do Supabase.',
            };
        }

        const now = Date.now();
        for (const user of data.users) {
            const role = user.app_metadata?.role;
            const isBanned = user.banned_until && Date.parse(user.banned_until) > now;

            if (!isStaffRole(role) || !user.email || !user.email_confirmed_at || user.deleted_at || isBanned) {
                continue;
            }

            const name = [user.user_metadata?.full_name, user.user_metadata?.name]
                .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
                ?.trim() ?? '';

            users.push({
                id: user.id,
                email: user.email,
                name,
                role,
                createdAt: user.created_at,
                lastSignInAt: user.last_sign_in_at ?? null,
            });
        }

        if (data.users.length < USERS_PER_PAGE) {
            break;
        }
    }

    users.sort((first, second) => {
        const firstActivity = first.lastSignInAt ?? first.createdAt;
        const secondActivity = second.lastSignInAt ?? second.createdAt;
        return Date.parse(secondActivity) - Date.parse(firstActivity);
    });

    return { users, error: null };
}