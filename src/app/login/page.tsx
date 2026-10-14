import { LoginForm } from './login-form';
import { Logo } from '../components/logo';
import { Button } from '../components/button';
import { Home } from 'lucide-react';

type LoginPageProps = {
    searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { error } = await searchParams;

    return (
        <main className="flex flex-col min-h-screen items-center justify-center bg-neutral-50 px-5 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-slate-100">
            <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm dark:bg-neutral-800 sm:p-9">
                <div className="flex flex-col items-center mb-5">
                    <Logo />
                </div>
                <h3 className="text-xl text-center font-semibold text-slate-800 dark:text-slate-200">Log in</h3>
                <p className="mb-5 text-sm leading-5 text-neutral-600 dark:text-neutral-400 text-center">
                    Acesse para interagir com os eventos da sua instituição.
                </p>

                {error === 'unauthorized' && (
                    <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                        Sua conta não possui uma função de equipe autorizada.
                    </p>
                )}

                <LoginForm />
            </section>

            <Button href="/" variant="ghost" className="mt-5" icon={Home}>
                Página inicial
            </Button>
        </main>
    );
}