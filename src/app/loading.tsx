import { Logo } from '@/app/components/logo';

export default function Loading() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background text-foreground"
        >
            <Logo isSquare turnOIntoIcon />
            <span className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <span className="sr-only">Carregando...</span>
        </div>
    );
}