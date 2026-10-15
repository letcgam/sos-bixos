'use client';

import { Logo } from '@/app/components/logo';
import Link from 'next/link';
import { Copyright } from 'lucide-react';

export default function Footer() {
    return (
        <header className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
                <Link href="/">
                    <Logo size="xs" />
                </Link>

                <p className="text-xs text-slate-400 flex items-center p-0">
                    Copyright {new Date().getFullYear()} <Copyright size={16} className="pb-0.5"/>
                </p>
            </div>
        </header>
    );
}
