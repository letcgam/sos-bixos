import { requireAuthenticatedUser } from '@/lib/auth';
import { getUnidadeInstituicao } from '@/lib/supabase-admin';
import { University } from 'lucide-react';
import { isStaffRole } from '@/lib/profile-role';
import Image from 'next/image';
import { Button } from '@/app/components/button';
import { UniversityPen } from '@/app/components/custom-icons'

export default async function InstituicaoPage() {
    const user = await requireAuthenticatedUser();
    const dadosInstituicaoUnidade = await getUnidadeInstituicao(user.id);
    const isStaff = isStaffRole(user.funcao);
    const isAdministrator = user.funcao === 'administrador';

    const instituicao = dadosInstituicaoUnidade?.instituicao || null;
    const dadosInstituicao = instituicao ?
        <div>
            <div>
                {
                    instituicao?.banner_url &&
                    <Image
                        alt="Banner da instituição"
                        src={instituicao.banner_url}
                        width={200}
                        height={50}
                        className="w-1/1 aspect-4/1 object-cover"
                    />
                }
                <div className="items-center -translate-y-1/2 px-3 h-1/2">
                    {
                        instituicao?.logo_url
                        ? <Image
                            alt="Logo da instituição"
                            src={instituicao.logo_url}
                            width={70}
                            height={70}
                            className="aspect-square object-cover rounded-md border-2 border-neutral-50 dark:border-neutral-700"
                        />
                        : <University className="h-14 w-14 p-2 rounded-md bg-neutral-200 dark:bg-neutral-700" strokeWidth={1.5}/>
                    }
                </div>
            </div>

            <b className="text-2xl">{[instituicao?.sigla, instituicao?.nome].filter(Boolean).join(" - ")}</b>

            {
                isAdministrator &&
                <div className="mt-8 text-center">
                    <Button
                        href="/instituicao/editar"
                        icon={UniversityPen}
                        variant="outline"
                        size="sm"
                    >
                        Editar instituição
                    </Button>
                </div>
            }
        </div> :
        null;

    const unidade = dadosInstituicaoUnidade?.unidade || null;
    const dadosUnidade = unidade
        ? <div>
            <div className="flex items-start gap-2">
                {
                    unidade?.logo_url &&
                    <Image
                        alt="Foto de perfil atual"
                        src={unidade?.logo_url}
                        width={60}
                        height={60}
                        sizes="1em"
                        className="aspect-square rounded-md border border-neutral-50 dark:border-neutral-700"
                    />
                }
                <div>
                    <p className="text-xl text-indigo-700 dark:text-indigo-300">Unidade</p>
                    <p className="text-xl font-bold">{unidade?.nome}</p>
                </div>
            </div>

            <p className="mt-3">{[unidade?.cidade, unidade?.estado].filter(Boolean).join(", ")}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{unidade?.endereco}</p>

            {
                isStaff &&
                <div className="mt-8 text-center">
                    <Button
                        href="/instituicao/unidade/editar"
                        icon={UniversityPen}
                        variant="outline"
                        size="sm"
                    >
                        Editar unidade
                    </Button>
                </div>
            }
        </div>
        : null;

    return (
        <main className="bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="mx-auto max-w-3xl p-5">
                {
                    dadosInstituicao || <p>nada</p>
                }

                <hr className="my-6 border-t border-neutral-500"/>

                {
                    dadosUnidade || <p>nada</p>
                }
            </section>
        </main>
    );
}
