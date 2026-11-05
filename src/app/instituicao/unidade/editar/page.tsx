import { Button } from '@/app/components/button';
import { requireAuthenticatedUser } from '@/lib/auth';
import { isStaffRole } from '@/lib/profile-role';
import { getUnidadeEditor } from '@/lib/supabase-admin';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { UnidadeForm } from './unidade-form';

export default async function EditarUnidadePage() {
    const user = await requireAuthenticatedUser();
    if (!isStaffRole(user.funcao)) {
        redirect('/instituicao');
    }

    const result = await getUnidadeEditor(user.id);

    return (
        <main className="bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="mx-auto max-w-3xl px-5 py-10">
                <h1 className="text-3xl font-semibold">Editar unidade</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Atualize as informações da sua unidade.
                </p>

                {result.data ? (
                    <UnidadeForm unidade={result.data} />
                ) : (
                    <div className="mt-7 space-y-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        <p role="alert">{result.error}</p>
                        <Button href="/instituicao" icon={ArrowLeft} size="sm">
                            Voltar
                        </Button>
                    </div>
                )}
            </section>
        </main>
    );
}
