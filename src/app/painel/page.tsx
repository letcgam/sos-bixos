import Image from 'next/image';
import { ColorModeToggle } from '@/app/components/color-mode-toggle';
import { requireStaff } from '@/lib/auth';
import { getStaffProfileSummary } from '@/lib/supabase-admin';
import { LogOut, UserRoundPen, UserRound } from 'lucide-react';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/app/components/button';

export default async function PanelPage() {
    const staff = await requireStaff();
    const profile = await getStaffProfileSummary(staff.id);
    const funcaoPerfil = staff.funcao === 'administrador' ? 'Administrador' : 'Moderador';
    const logoInstituicao = profile?.campus?.logo_url || profile?.universidade?.logo_url || "";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl px-5 py-10">
                <div className="flex gap-2 items-center my-2 text-3xl font-semibold">
                    {
                        profile?.fotoPerfilUrl
                        ? <Image
                            alt="Foto de perfil atual"
                            src={profile?.fotoPerfilUrl}
                            width={50}
                            height={50}
                            unoptimized
                            sizes="1em"
                            className="object-cover rounded-full h-[2em] w-[2em] border-3 border-slate-600"
                        />
                        : <UserRound aria-hidden="true" className="h-[2em] w-[2em] p-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    }
                    <div className="flex flex-col">
                        <h1>Olá, {profile?.nome || staff.email}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-500">{staff.email}</p>
                    </div>
                </div>

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

                {
                    funcaoPerfil
                    ? <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{funcaoPerfil}</p>
                    : ""
                }

                <form action={signOutAction} className="mt-3">
                    <Button type="submit" variant="outline" size="sm" icon={LogOut} iconPosition="right">
                        Sair
                    </Button>
                </form>

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
                        <Button
                            href="/painel/perfil"
                            icon={UserRoundPen}
                            size="sm"
                            variant="outline"
                        >
                            Editar
                        </Button>
                    </div>
                </section>
            </section>
        </main>
    );
}