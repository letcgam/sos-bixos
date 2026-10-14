'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/button';
import { Logo } from '@/app/components/logo';
import Link from 'next/link';
import { ArrowRight, Home, CircleUserRound } from 'lucide-react';
import Image from 'next/image';

function getHeaderBtn(pathname:string = "/", isAuthenticated:boolean = false, fotoPerfil:string = "") {
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

export default function Header({ isAuthenticated = false, fotoPerfil = "" }: { readonly isAuthenticated?: boolean; readonly fotoPerfil?: string; }) {
    const pathname = usePathname();
    const headerBtn = getHeaderBtn(pathname, isAuthenticated, fotoPerfil);

    return (
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
        </header>
    );
}
