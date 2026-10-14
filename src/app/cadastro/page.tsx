import { Logo } from '@/app/components/logo';
import { getStudentSignupOptions } from '@/lib/supabase-admin';
import { SignupForm } from './signup-form';

export default async function SignupPage() {
    const result = await getStudentSignupOptions();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-5 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-sm dark:bg-neutral-800 sm:p-9">
                <div className="mb-5 flex flex-col items-center">
                    <Logo />
                    <h1 className="mt-2 text-xl font-semibold">Criar conta de estudante</h1>
                    <p className="mt-2 text-center text-sm leading-5 text-neutral-600 dark:text-neutral-400">
                        Preencha seus dados para criar sua conta.
                    </p>
                </div>

                {result.data ? (
                    result.data.campi.length > 0 ? (
                        <SignupForm options={result.data} />
                    ) : (
                        <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                            Ainda não há campi disponíveis para cadastro.
                        </p>
                    )
                ) : (
                    <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                        {result.error}
                    </p>
                )}
            </section>
        </main>
    );
}
