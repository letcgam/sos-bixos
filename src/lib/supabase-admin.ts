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
    fotoPerfilUrl: string | null;
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

export type StaffProfileEditorData = {
    nome: string;
    sobrenome: string;
    ra: string;
    fotoPerfilUrl: string | null;
    temFotoPerfil: boolean;
    fotoPerfilError: string | null;
    campusId: number;
    cursoId: number;
    anoIngresso: number;
    semestreIngresso: number | null;
    campi: { id: number; nome: string }[];
    cursos: { id: number; campusId: number; nome: string }[];
};

export type StaffProfileUpdate = {
    nome: string;
    sobrenome: string | null;
    ra: string | null;
    fotoPerfilUrl?: string | null;
    campusId: number;
    cursoId: number;
    anoIngresso: number;
    semestreIngresso: number | null;
};

const USERS_PER_PAGE = 1000;
const PROFILE_PHOTO_BUCKET = 'user';

const PROFILE_PHOTO_EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

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
            foto_perfil_url,
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
    const fotoPerfilPath = data.foto_perfil_url;
    let fotoPerfilUrl: string | null = null;

    if (typeof fotoPerfilPath === 'string' && fotoPerfilPath) {
        if (/^https?:\/\//i.test(fotoPerfilPath)) {
            fotoPerfilUrl = fotoPerfilPath;
        } else {
            const supabase = createAdminClient();
            const { data: photo, error: photoError } = supabase
                ? await supabase.storage
                    .from(PROFILE_PHOTO_BUCKET)
                    .createSignedUrl(fotoPerfilPath, 60 * 60)
                : { data: null, error: new Error('Supabase admin client is not configured.') };

            if (photoError) {
                console.error('Failed to create signed URL for header profile photo:', photoError);
            } else {
                fotoPerfilUrl = photo.signedUrl;
            }
        }
    }

    return {
        nome: typeof data.nome === 'string' ? data.nome : null,
        fotoPerfilUrl,
        campus,
        universidade,
    };
}

export async function getStaffProfileEditor(
    userId: string,
): Promise<{ data: StaffProfileEditorData; error: null } | { data: null; error: string }> {
    const supabase = createAdminClient();

    if (!supabase) {
        return {
            data: null,
            error: 'A edição de perfil não está configurada. Configure SUPABASE_SECRET_KEY no servidor.',
        };
    }

    const { data: profile, error: profileError } = await supabase
        .from('perfil')
        .select(`
            nome,
            sobrenome,
            ra,
            foto_perfil_url,
            campi_id,
            curso_id,
            ano_ingresso,
            semestre_ingresso,
            campus:campi!aluno_campi_id_fkey (
                universidade_id
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('Failed to load profile for editing:', profileError);
        return { data: null, error: 'Não foi possível carregar seus dados. Tente novamente.' };
    }

    if (!profile) {
        return { data: null, error: 'Não foi encontrado um perfil para esta conta.' };
    }

    const fotoPerfilPath = profile.foto_perfil_url ?? null;
    let fotoPerfilUrl = fotoPerfilPath;
    let fotoPerfilError: string | null = null;
    if (fotoPerfilPath && !/^https?:\/\//i.test(fotoPerfilPath)) {
        const { data: photo, error: photoError } = await supabase.storage
            .from(PROFILE_PHOTO_BUCKET)
            .createSignedUrl(fotoPerfilPath, 60 * 60);

        if (photoError) {
            console.error('Failed to create signed URL for staff profile photo:', photoError);
            fotoPerfilUrl = null;
            fotoPerfilError = 'Não foi possível carregar a foto atual. Você ainda pode escolher outra.';
        } else {
            fotoPerfilUrl = photo.signedUrl;
        }
    }

    const rawCampus = Array.isArray(profile.campus) ? profile.campus[0] ?? null : profile.campus;
    const universityId = rawCampus?.universidade_id;
    if (typeof universityId !== 'number') {
        return { data: null, error: 'Não foi possível identificar a instituição do seu campus.' };
    }

    const { data: campuses, error: campusesError } = await supabase
        .from('campi')
        .select('id, nome')
        .eq('universidade_id', universityId)
        .order('nome');

    if (campusesError) {
        console.error('Failed to load campuses for profile editing:', campusesError);
        return { data: null, error: 'Não foi possível carregar os campi da sua instituição.' };
    }

    const campusIds = (campuses ?? []).map((campus) => campus.id);
    const { data: courses, error: coursesError } = campusIds.length > 0
        ? await supabase
            .from('curso')
            .select('id, nome, camp_id')
            .in('camp_id', campusIds)
            .order('nome')
        : { data: [], error: null };

    if (coursesError) {
        console.error('Failed to load courses for profile editing:', coursesError);
        return { data: null, error: 'Não foi possível carregar os cursos da sua instituição.' };
    }

    return {
        data: {
            nome: profile.nome,
            sobrenome: profile.sobrenome ?? '',
            ra: profile.ra ?? '',
            fotoPerfilUrl,
            temFotoPerfil: Boolean(fotoPerfilPath),
            fotoPerfilError,
            campusId: profile.campi_id,
            cursoId: profile.curso_id,
            anoIngresso: profile.ano_ingresso,
            semestreIngresso: profile.semestre_ingresso ?? null,
            campi: (campuses ?? []).map((campus) => ({
                id: campus.id,
                nome: campus.nome ?? `Campus ${campus.id}`,
            })),
            cursos: (courses ?? []).map((course) => ({
                id: course.id,
                campusId: course.camp_id,
                nome: course.nome,
            })),
        },
        error: null,
    };
}

export async function updateStaffProfile(
    userId: string,
    profileUpdate: StaffProfileUpdate,
): Promise<{ error: string | null }> {
    const supabase = createAdminClient();

    if (!supabase) {
        return { error: 'A edição de perfil não está configurada. Configure SUPABASE_SECRET_KEY no servidor.' };
    }

    const { data: profile, error: profileError } = await supabase
        .from('perfil')
        .select(`
            foto_perfil_url,
            campus:campi!aluno_campi_id_fkey (
                universidade_id
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('Failed to verify profile institution:', profileError);
        return { error: 'Não foi possível validar seu perfil. Tente novamente.' };
    }

    if (!profile) {
        return { error: 'Não foi encontrado um perfil para esta conta.' };
    }

    const rawCampus = Array.isArray(profile.campus) ? profile.campus[0] ?? null : profile.campus;
    const universityId = rawCampus?.universidade_id;
    if (typeof universityId !== 'number') {
        return { error: 'Não foi possível identificar a instituição do seu campus.' };
    }

    const { data: campus, error: campusError } = await supabase
        .from('campi')
        .select('id')
        .eq('id', profileUpdate.campusId)
        .eq('universidade_id', universityId)
        .maybeSingle();

    if (campusError) {
        console.error('Failed to validate selected campus:', campusError);
        return { error: 'Não foi possível validar o campus escolhido.' };
    }

    if (!campus) {
        return { error: 'Escolha um campus da mesma instituição do seu perfil atual.' };
    }

    const { data: course, error: courseError } = await supabase
        .from('curso')
        .select('id')
        .eq('id', profileUpdate.cursoId)
        .eq('camp_id', profileUpdate.campusId)
        .maybeSingle();

    if (courseError) {
        console.error('Failed to validate selected course:', courseError);
        return { error: 'Não foi possível validar o curso escolhido.' };
    }

    if (!course) {
        return { error: 'Escolha um curso disponível no campus selecionado.' };
    }

    const profileChanges = {
        nome: profileUpdate.nome,
        sobrenome: profileUpdate.sobrenome,
        ra: profileUpdate.ra,
        campi_id: profileUpdate.campusId,
        curso_id: profileUpdate.cursoId,
        ano_ingresso: profileUpdate.anoIngresso,
        semestre_ingresso: profileUpdate.semestreIngresso,
        ...(profileUpdate.fotoPerfilUrl !== undefined
            ? { foto_perfil_url: profileUpdate.fotoPerfilUrl }
            : {}),
    };

    const { error: updateError } = await supabase
        .from('perfil')
        .update(profileChanges)
        .eq('id', userId);

    if (updateError) {
        console.error('Failed to update staff profile:', updateError);
        return { error: 'Não foi possível salvar seus dados. Tente novamente.' };
    }

    if (
        profileUpdate.fotoPerfilUrl !== undefined
        && profile.foto_perfil_url
        && profile.foto_perfil_url !== profileUpdate.fotoPerfilUrl
        && isOwnedProfilePhotoPath(profile.foto_perfil_url, userId)
    ) {
        await deleteStaffProfilePhoto(profile.foto_perfil_url);
    }

    return { error: null };
}

export async function uploadStaffProfilePhoto(
    userId: string,
    file: File,
): Promise<{ path: string; error: null } | { path: null; error: string }> {
    const supabase = createAdminClient();
    if (!supabase) {
        return {
            path: null,
            error: 'O upload de foto não está configurado. Configure SUPABASE_SECRET_KEY no servidor.',
        };
    }

    const extension = PROFILE_PHOTO_EXTENSIONS[file.type];
    if (!extension) {
        return { path: null, error: 'Formato de imagem não permitido.' };
    }

    const path = `profile/${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
        .from(PROFILE_PHOTO_BUCKET)
        .upload(path, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        console.error('Failed to upload staff profile photo:', error);
        return { path: null, error: 'Não foi possível enviar a foto. Tente novamente.' };
    }

    return { path, error: null };
}

export async function deleteStaffProfilePhoto(path: string): Promise<void> {
    const supabase = createAdminClient();
    if (!supabase) {
        console.error('Cannot remove uploaded profile photo: Supabase admin client is not configured.');
        return;
    }

    const { error } = await supabase.storage
        .from(PROFILE_PHOTO_BUCKET)
        .remove([path]);

    if (error) {
        console.error('Failed to remove unreferenced staff profile photo:', error);
    }
}

function isOwnedProfilePhotoPath(path: string, userId: string): boolean {
    return path.startsWith(`profile/${userId}/`) && !/^https?:\/\//i.test(path);
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