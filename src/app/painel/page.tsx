import Image from 'next/image';
import Link from 'next/link';
import { ColorModeToggle } from '@/app/components/color-mode-toggle';
import { requireStaff } from '@/lib/auth';
import { getStaffProfileSummary, listActiveAuthUsers } from '@/lib/supabase-admin';
import { UsersRound, LogOut, UserRoundPen } from 'lucide-react';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/app/components/button';

function formatDate(value: string | null) {
    if (!value) return 'Nunca acessou';

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function ActiveUsersList({ result }: Readonly<{ result: Awaited<ReturnType<typeof listActiveAuthUsers>>; }>) {
    if (result.error) {
        return (
            <p role="alert" className="border-y border-amber-300 py-5 text-sm text-amber-900 dark:border-amber-800 dark:text-amber-200">
                {result.error}
            </p>
        );
    }

    if (result.users.length === 0) {
        return (
            <p className="border-y border-slate-200 py-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                Nenhuma conta ativa encontrada.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto border-y border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-170 text-left text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                        <th scope="col" className="py-3 pr-5 font-medium">Conta</th>
                        <th scope="col" className="px-5 py-3 font-medium">Cargo</th>
                        <th scope="col" className="px-5 py-3 font-medium">Criada em</th>
                        <th scope="col" className="py-3 pl-5 font-medium">Último acesso</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {result.users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-4 pr-5">
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {user.name || user.email}
                                </p>
                                {user.name && (
                                    <p className="mt-0.5 text-slate-600 dark:text-slate-400">{user.email}</p>
                                )}
                            </td>
                            <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                {user.role === 'admin' ? 'Administrador' : 'Moderador'}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">
                                <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
                            </td>
                            <td className="whitespace-nowrap py-4 pl-5 text-slate-600 dark:text-slate-400">
                                {user.lastSignInAt ? (
                                    <time dateTime={user.lastSignInAt}>{formatDate(user.lastSignInAt)}</time>
                                ) : (
                                    'Nunca acessou'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default async function PanelPage() {
    const staff = await requireStaff();
    const profile = await getStaffProfileSummary(staff.id);
    const roleLabel = staff.role === 'admin' ? 'Administrador' : 'Moderador';
    const usersResult = staff.role === 'admin' ? await listActiveAuthUsers() : null;
    const logoInstituicao = profile?.campus?.logo_url || profile?.universidade?.logo_url || "";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl px-5 py-10">

                <div className="flex justify-between gap-2 items-baseline">
                    <h1 className="mt-2 text-3xl font-semibold">
                        Olá, {profile?.nome || staff.email}
                    </h1>

                    <form action={signOutAction}>
                        <Button type="submit" variant="outline" size="sm" icon={LogOut} iconPosition="right">
                            Sair
                        </Button>
                    </form>
                </div>
                {
                    roleLabel
                    ? <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{roleLabel}</p>
                    : ""
                }
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">{staff.email}</p>

                <div className="flex gap-2 items-start">
                    {
                        logoInstituicao
                        ? <Image src={logoInstituicao} width={40} height={40} alt="Logo da instituição" className="object-contain aspect-square p-1" />
                        : null
                    }
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        { profile?.campus?.nome || profile?.universidade?.nome }
                    </p>
                </div>
                {/* <pre>{JSON.stringify(profile, null, 2)}</pre> */}

                <section aria-labelledby="settings-heading" className="mt-9 border-y border-slate-200 py-5 dark:border-slate-800">
                    <h2 id="settings-heading" className="text-lg font-semibold">Configurações</h2>
                    <div className="mt-4 flex items-center justify-between gap-6">
                        <div>
                            <h3 className="text-sm font-medium">Aparência</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Escolha entre o modo claro e o modo escuro.
                            </p>
                        </div>
                        <ColorModeToggle />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-6">
                        <div>
                            <h3 className="text-sm font-medium">Minha conta</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Altere seus dados.
                            </p>
                        </div>
                        <Link
                            href="/painel/perfil"
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus:ring-offset-neutral-950"
                        >
                            <UserRoundPen aria-hidden="true" className="h-4 w-4" />
                            Editar
                        </Link>
                    </div>
                </section>

                <section aria-labelledby="active-users-heading" className="mt-12">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <UsersRound aria-hidden="true" className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                                <h2 id="active-users-heading" className="text-xl font-semibold">Usuários ativos</h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Contas da equipe habilitadas para acessar o painel.
                            </p>
                        </div>
                        {usersResult && !usersResult.error && (
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {usersResult.users.length} {usersResult.users.length === 1 ? 'usuário' : 'usuários'}
                            </p>
                        )}
                    </div>

                    {usersResult ? (
                        <ActiveUsersList result={usersResult} />
                    ) : (
                        <p className="border-y border-slate-200 py-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                            A lista de contas está disponível apenas para administradores.
                        </p>
                    )}
                </section>
            </section>
        </main>
    );
}