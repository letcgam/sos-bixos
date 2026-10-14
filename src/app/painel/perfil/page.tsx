import { requireAuthenticatedUser } from '@/lib/auth';
import { isStaffRole } from '@/lib/profile-role';
import { getStaffProfileEditor } from '@/lib/supabase-admin';
import { ProfileForm } from './profile-form';
import { Button } from '@/app/components/button';
import { ArrowLeft } from 'lucide-react';

export default async function EditProfilePage() {
    const staff = await requireAuthenticatedUser();
    const result = await getStaffProfileEditor(staff.id);
    const backHref = isStaffRole(staff.funcao) ? '/painel' : '/';

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="mx-auto max-w-3xl px-5 py-10">
                <h1 className="text-3xl font-semibold">Editar meus dados</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Atualize as informações do seu perfil.
                </p>

                {result.data === null ? (
                    <div className="mt-7 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        <p role="alert">{result.error}</p>
                        <Button href={backHref} icon={ArrowLeft} size="sm">
                            Voltar
                        </Button>
                    </div>
                ) : (
                    <ProfileForm profile={result.data} backHref={backHref} />
                )}
            </section>
        </main>
    );
}
