'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/button';
import { Logo } from '@/app/components/logo';
import Link from 'next/link';
import { ArrowRight, House, CircleUserRound } from 'lucide-react';
import Image from 'next/image';

export default function Header({ isStaff = false, fotoPerfil = "" }: { readonly isStaff: boolean, readonly fotoPerfil?: string }) {
    const pathname = usePathname();
    const profileIcon = fotoPerfil
        ? <Image
            alt="Foto de perfil atual"
            src={fotoPerfil}
            width={50}
            height={50}
            unoptimized
            sizes="1em"
            className="object-cover rounded-full h-[1.6em] w-[1.6em] border-2 border-slate-400"
        />
        : <CircleUserRound aria-hidden="true" className="text-xs" />;

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
                {isStaff ?
                    (
                        pathname === '/painel'
                        ? <Link href="/">
                            <Button size="sm" variant="outline" icon={House}>Página inicial</Button>
                        </Link>
                        : <Link href="/painel">
                            <Button size="sm" variant="ghost" className="ps-2">
                                {profileIcon}
                                Minha conta
                            </Button>
                        </Link>
                    )
                :
                    <Link href="/login">
                        <Button size="sm" variant="primary" icon={ArrowRight}>Login</Button>
                    </Link>
                }
            </div>
        </header>
    );
}
