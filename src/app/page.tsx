import { Logo } from './components/logo';

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
            <Logo isSquare={true} turnOIntoIcon={true} />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">Bem vindo!</h3>
        </main>
    );
}