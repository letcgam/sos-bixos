'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/components/theme-provider';

export function ColorModeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            role="switch"
            aria-label="Modo escuro"
            aria-checked={isDark}
            title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-slate-300 bg-slate-200 p-1 transition-colors hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-neutral-950"
        >
            <span
                className={`absolute left-1 inline-flex size-7 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm transition-transform dark:bg-slate-100 dark:text-indigo-700 ${isDark ? 'translate-x-7' : 'translate-x-0'}`}
            >
                {isDark ? <Moon aria-hidden="true" className="size-4" /> : <Sun aria-hidden="true" className="size-4" />}
            </span>
        </button>
    );
}