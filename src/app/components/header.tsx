'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/button';
import { Logo } from '@/app/components/logo';
import Link from 'next/link';
import { ArrowRight, Home, CircleUserRound } from 'lucide-react';
import Image from 'next/image';

function getHeaderBtn(
    pathname: string = '/',
    isAuthenticated: boolean = false,
    fotoPerfil: string = '',
) {
    if (!isAuthenticated)
        return <Button href="/login" size="sm" variant="primary" icon={ArrowRight}>Login</Button>;

    const profileIcon = isAuthenticated && fotoPerfil
        ? <Image alt="Foto de perfil atual" src={fotoPerfil} width={50} height={50} unoptimized sizes="1em" className="object-cover rounded-full h-[1.6em] w-[1.6em] border-2 border-slate-400"/>
        : <CircleUserRound aria-hidden="true" className="text-xs" />;

        switch (pathname) {
            case '/painel':
                return <Button href="/" size="sm" variant="outline" icon={Home}>Página inicial</Button>;
            default:
                return <Button href="/painel" size="sm" variant="ghost" className="ps-2">
                    {profileIcon}
                    Minha conta
                </Button>;
        }
}

export default function Header({
    isAuthenticated = false,
    fotoPerfil = '',
}: {
    readonly isAuthenticated?: boolean;
    readonly fotoPerfil?: string;
}) {
    const pathname = usePathname();
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const [observedPathname, setObservedPathname] = useState(pathname);

    if (pathname !== observedPathname) {
        setObservedPathname(pathname);
        setPendingPath(null);
    }

    useEffect(() => {
        function handleDocumentClick(event: MouseEvent) {
            if (
                event.button !== 0
                || event.metaKey
                || event.ctrlKey
                || event.shiftKey
                || event.altKey
                || !(event.target instanceof Element)
            ) {
                return;
            }

            const link = event.target.closest('a[href]');
            if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) {
                return;
            }

            if (link.target && link.target !== '_self') {
                return;
            }

            const destination = new URL(link.href, window.location.href);
            if (destination.origin !== window.location.origin) {
                return;
            }

            setPendingPath(
                destination.pathname === window.location.pathname
                    ? null
                    : destination.pathname,
            );
        }

        document.addEventListener('click', handleDocumentClick, true);
        return () => document.removeEventListener('click', handleDocumentClick, true);
    }, []);

    const headerBtn = getHeaderBtn(pathname, isAuthenticated, fotoPerfil);

    return (
        <header className="relative z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div>
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                </div>
                { headerBtn }
            </div>
            {pendingPath !== null && pendingPath !== pathname && (
                <div
                    role="status"
                    aria-label="Carregando página"
                    className="absolute inset-x-0 bottom-0 h-1 translate-y-full overflow-hidden bg-indigo-100 dark:bg-neutral-800"
                >
                    <motion.div
                        aria-hidden="true"
                        className="h-full w-1/3 bg-indigo-600 dark:bg-indigo-400"
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>
            )}
        </header>
    );
}
