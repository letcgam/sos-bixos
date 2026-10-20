import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { isStaffRole, type ProfileFunction, type StaffRole } from '@/lib/profile-role';

export type ActiveAuthUser = {
    id: string;
    email: string;
    name: string;
    funcao: StaffRole;
    createdAt: string;
    lastSignInAt: string | null;
};

export type StaffProfileSummary = {
    nome: string | null;
    fotoPerfilUrl: string | null;
    funcao: ProfileFunction | null;
    unidade: {
        nome: string | null;
        cidade: string | null;
        estado: string | null;
        endereco: string | null;
        logo_url: string | null;
        instituicao: {
            nome: string | null;
            sigla: string | null;
            logo_url: string | null;
        } | null;
    } | null;
    instituicao: {
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
    unidadeId: number;
    cursoId: number;
    anoIngresso: number;
    semestreIngresso: number | null;
    unidades: { id: number; nome: string }[];
    cursos: { id: number; unidadeId: number; nome: string }[];
};

export type StaffProfileUpdate = {
    nome: string;
    sobrenome: string | null;
    ra: string | null;
    fotoPerfilUrl?: string | null;
    unidadeId: number;
    cursoId: number;
    anoIngresso: number;
    semestreIngresso: number | null;
};

export type StudentSignupOptions = {
    instituicoes: { id: number; nome: string }[];
    unidades: { id: number; instituicaoId: number; nome: string }[];
    cursos: { id: number; unidadeId: number; nome: string }[];
};

// 1. Array constante com todos os valores permitidos
export const PROFILE_TYPES = ['aluno', 'moderador', 'administrador'] as const;

// 2. Extrai o tipo automaticamente a partir do array ('aluno' | 'moderador' | 'administrador')
export type ProfileTypes = typeof PROFILE_TYPES[number];

// 3. Função Type Guard para verificar em tempo de execução
export function isProfileType(value: unknown): value is ProfileTypes {
    return typeof value === 'string' && PROFILE_TYPES.includes(value as ProfileTypes);
}

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

export async function getProfileFunction(
    userId: string,
): Promise<{ funcao: ProfileFunction | null; error: string | null }> {
    const supabase = createAdminClient();
    if (!supabase) {
        return {
            funcao: null,
            error: 'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente do servidor.',
        };
    }

    const { data, error } = await supabase
        .from('perfil')
        .select('funcao')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Failed to load user profile function:', error);
        return { funcao: null, error: 'Não foi possível verificar a função do perfil.' };
    }

    const funcao = data?.funcao;
    if (isProfileType(funcao)) {
        return { funcao, error: null };
    }

    if (data) {
        console.error('User profile has an unsupported function:', funcao);
    }

    return { funcao: null, error: null };
}

export async function getStudentSignupOptions(): Promise<
    { data: StudentSignupOptions; error: null }
    | { data: null; error: string }
> {
    const supabase = createAdminClient();
    if (!supabase) {
        return {
            data: null,
            error: 'O cadastro não está configurado. Configure SUPABASE_SECRET_KEY no servidor.',
        };
    }

    const { data: universities, error: universitiesError } = await supabase
        .from('instituicao')
        .select('id, nome, sigla')
        .order('nome');

    if (universitiesError) {
        console.error('Failed to load universities for student signup:', universitiesError);
        return { data: null, error: 'Não foi possível carregar as instituições para o cadastro.' };
    }

    const { data: unidades, error: unidadesError } = await supabase
        .from('unidade')
        .select('id, nome, instituicao_id')
        .order('nome');

    if (unidadesError) {
        console.error('Failed to load unidades for student signup:', unidadesError);
        return { data: null, error: 'Não foi possível carregar os unidades para o cadastro.' };
    }

    const unidadeIds = (unidades ?? []).map((unidade) => unidade.id);
    const { data: courses, error: coursesError } = unidadeIds.length > 0
        ? await supabase
            .from('curso')
            .select('id, nome, unidade_id')
            .in('unidade_id', unidadeIds)
            .order('nome')
        : { data: [], error: null };

    if (coursesError) {
        console.error('Failed to load courses for student signup:', coursesError);
        return { data: null, error: 'Não foi possível carregar os cursos para o cadastro.' };
    }

    return {
        data: {
            instituicoes: (universities ?? []).map((university) => ({
                id: university.id,
                nome: university.nome ?? `Instituição ${university.id}`,
            })),
            unidades: (unidades ?? []).map((unidade) => ({
                id: unidade.id,
                instituicaoId: unidade.instituicao_id,
                nome: unidade.nome ?? `unidade ${unidade.id}`,
            })),
            cursos: (courses ?? []).map((course) => ({
                id: course.id,
                unidadeId: course.unidade_id,
                nome: course.nome,
            })),
        },
        error: null,
    };
}

export async function createProfile(
    userId: string,
    profile: {
        nome: string;
        sobrenome: string;
        instituicaoId: number;
        unidadeId: number;
        cursoId: number;
        anoIngresso: number;
        semestreIngresso: number | null;
    },
): Promise<{ error: string | null }> {
    const supabase = createAdminClient();
    if (!supabase) {
        return { error: 'O cadastro não está configurado. Configure SUPABASE_SECRET_KEY no servidor.' };
    }

    const { data: unidade, error: unidadeError } = await supabase
        .from('unidade')
        .select('id')
        .eq('id', profile.unidadeId)
        .eq('instituicao_id', profile.instituicaoId)
        .maybeSingle();

    if (unidadeError) {
        console.error('Failed to validate unidade for student signup:', unidadeError);
        return { error: 'Não foi possível validar a instituição e o unidade selecionados.' };
    }

    if (!unidade) {
        return { error: 'O unidade selecionado não pertence à instituição escolhida.' };
    }

    const { data: course, error: courseError } = await supabase
        .from('curso')
        .select('id')
        .eq('id', profile.cursoId)
        .eq('unidade_id', profile.unidadeId)
        .maybeSingle();

    if (courseError) {
        console.error('Failed to validate course for student signup:', courseError);
        return { error: 'Não foi possível validar o curso selecionado.' };
    }

    if (!course) {
        return { error: 'Escolha um curso disponível no unidade selecionado.' };
    }

    const { error: insertError } = await supabase
        .from('perfil')
        .insert({
            id: userId,
            nome: profile.nome,
            sobrenome: profile.sobrenome || null,
            unidade_id: profile.unidadeId,
            curso_id: profile.cursoId,
            ano_ingresso: profile.anoIngresso,
            semestre_ingresso: profile.semestreIngresso,
            funcao: 'aluno',
        });

    if (insertError) {
        console.error('Failed to create student profile:', insertError);
        return { error: 'Não foi possível criar o perfil da conta.' };
    }

    return { error: null };
}

export async function deleteAuthUser(userId: string): Promise<void> {
    const supabase = createAdminClient();
    if (!supabase) {
        console.error('Cannot remove incomplete signup: Supabase admin client is not configured.');
        return;
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
        console.error('Failed to remove incomplete signup user:', error);
    }
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
            funcao,
            foto_perfil_url,
            unidade:unidade!perfil_unidade_id_fkey (
                nome,
                cidade,
                estado,
                endereco,
                logo_url,
                instituicao:instituicao!unidade_instituicao_id_fkey (
                    nome,
                    sigla,
                    logo_url
                )
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (error || !data) return null;

    const rawunidade = Array.isArray(data.unidade) ? data.unidade[0] ?? null : data.unidade ?? null;
    const unidade = rawunidade
        ? {
            nome: typeof rawunidade.nome === 'string' ? rawunidade.nome : null,
            cidade: typeof rawunidade.cidade === 'string' ? rawunidade.cidade : null,
            estado: typeof rawunidade.estado === 'string' ? rawunidade.estado : null,
            endereco: typeof rawunidade.endereco === 'string' ? rawunidade.endereco : null,
            logo_url: typeof rawunidade.logo_url === 'string' ? rawunidade.logo_url : null,
            instituicao: (() => {
                const rawinstituicao = Array.isArray(rawunidade.instituicao)
                    ? rawunidade.instituicao[0] ?? null
                    : rawunidade.instituicao ?? null;

                return rawinstituicao
                    ? {
                        nome: typeof rawinstituicao.nome === 'string' ? rawinstituicao.nome : null,
                        sigla: typeof rawinstituicao.sigla === 'string' ? rawinstituicao.sigla : null,
                        logo_url: typeof rawinstituicao.logo_url === 'string' ? rawinstituicao.logo_url : null,
                    }
                    : null;
            })(),
        }
        : null;

    const instituicao = unidade?.instituicao ?? null;
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
        funcao: isProfileType(data.funcao) ? data.funcao : null,
        unidade,
        instituicao,
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
            unidade_id,
            curso_id,
            ano_ingresso,
            semestre_ingresso,
            unidade:unidade!perfil_unidade_id_fkey (
                instituicao_id
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

    const rawunidade = Array.isArray(profile.unidade) ? profile.unidade[0] ?? null : profile.unidade;
    const universityId = rawunidade?.instituicao_id;
    if (typeof universityId !== 'number') {
        return { data: null, error: 'Não foi possível identificar a instituição do seu unidade.' };
    }

    const { data: unidades, error: unidadesError } = await supabase
        .from('unidade')
        .select('id, nome')
        .eq('instituicao_id', universityId)
        .order('nome');

    if (unidadesError) {
        console.error('Failed to load unidades for profile editing:', unidadesError);
        return { data: null, error: 'Não foi possível carregar os unidades da sua instituição.' };
    }

    const unidadeIds = (unidades ?? []).map((unidade) => unidade.id);
    const { data: courses, error: coursesError } = unidadeIds.length > 0
        ? await supabase
            .from('curso')
            .select('id, nome, unidade_id')
            .in('unidade_id', unidadeIds)
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
            unidadeId: profile.unidade_id,
            cursoId: profile.curso_id,
            anoIngresso: profile.ano_ingresso,
            semestreIngresso: profile.semestre_ingresso ?? null,
            unidades: (unidades ?? []).map((unidade) => ({
                id: unidade.id,
                nome: unidade.nome ?? `unidade ${unidade.id}`,
            })),
            cursos: (courses ?? []).map((course) => ({
                id: course.id,
                unidadeId: course.unidade_id,
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
            unidade:unidade!perfil_unidade_id_fkey (
                instituicao_id
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

    const rawunidade = Array.isArray(profile.unidade) ? profile.unidade[0] ?? null : profile.unidade;
    const universityId = rawunidade?.instituicao_id;
    if (typeof universityId !== 'number') {
        return { error: 'Não foi possível identificar a instituição do seu unidade.' };
    }

    const { data: unidade, error: unidadeError } = await supabase
        .from('unidade')
        .select('id')
        .eq('id', profileUpdate.unidadeId)
        .eq('instituicao_id', universityId)
        .maybeSingle();

    if (unidadeError) {
        console.error('Failed to validate selected unidade:', unidadeError);
        return { error: 'Não foi possível validar o unidade escolhido.' };
    }

    if (!unidade) {
        return { error: 'Escolha um unidade da mesma instituição do seu perfil atual.' };
    }

    const { data: course, error: courseError } = await supabase
        .from('curso')
        .select('id')
        .eq('id', profileUpdate.cursoId)
        .eq('unidade_id', profileUpdate.unidadeId)
        .maybeSingle();

    if (courseError) {
        console.error('Failed to validate selected course:', courseError);
        return { error: 'Não foi possível validar o curso escolhido.' };
    }

    if (!course) {
        return { error: 'Escolha um curso disponível no unidade selecionado.' };
    }

    const profileChanges = {
        nome: profileUpdate.nome,
        sobrenome: profileUpdate.sobrenome,
        ra: profileUpdate.ra,
        unidade_id: profileUpdate.unidadeId,
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
        const eligibleUsers = data.users.filter((user) => {
            const isBanned = user.banned_until && Date.parse(user.banned_until) > now;
            return Boolean(user.email && user.email_confirmed_at && !user.deleted_at && !isBanned);
        });

        const { data: profiles, error: profilesError } = eligibleUsers.length > 0
            ? await supabase
                .from('perfil')
                .select('id, funcao')
                .in('id', eligibleUsers.map((user) => user.id))
            : { data: [], error: null };

        if (profilesError) {
            console.error('Failed to load profile functions for active users:', profilesError);
            return {
                users: [],
                error: 'Não foi possível carregar as funções dos perfis.',
            };
        }

        const functionsByUserId = new Map(
            (profiles ?? []).map((profile) => [profile.id, profile.funcao]),
        );

        for (const user of eligibleUsers) {
            const funcao = functionsByUserId.get(user.id);
            if (!isStaffRole(funcao) || !user.email) continue;

            const name = [user.user_metadata?.full_name, user.user_metadata?.name]
                .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
                ?.trim() ?? '';

            users.push({
                id: user.id,
                email: user.email,
                name,
                funcao,
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