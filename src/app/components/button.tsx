import React from 'react';
import Link from 'next/link';

// 1. Definimos os tipos permitidos
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    icon?: React.ElementType;
    iconPosition?: 'left' | 'right';
}

type LinkButtonProps = ButtonBaseProps
    & Omit<React.ComponentProps<typeof Link>, keyof ButtonBaseProps | 'href'>
    & { href: React.ComponentProps<typeof Link>['href'] };

type NativeButtonProps = ButtonBaseProps
    & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps | 'href'>
    & { href?: never };

type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
    const {
        children,
        variant = 'primary',
        size = 'md',
        className = '',
        icon: Icon,
        iconPosition = 'left',
        ...elementProps
    } = props;

    const baseStyle =
        "inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 active:scale-95";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md shadow-indigo-200 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400 dark:shadow-none",
        secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-800 shadow-md dark:bg-slate-700 dark:hover:bg-slate-600 dark:focus:ring-slate-400 dark:shadow-none",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:ring-red-500 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 dark:hover:text-red-200 dark:focus:ring-red-400",
        outline: "border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300 dark:focus:ring-indigo-400",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-slate-400",
    };

    const sizes: Record<ButtonSize, string> = {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-5 py-2.5 text-base gap-2",
        lg: "px-6 py-3 text-lg gap-2.5",
    };

    const iconSize =
        size === 'sm' ? "w-4 h-4" : size === 'lg' ? "w-6 h-6" : "w-5 h-5";
    const buttonClassName = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;
    const content = (
        <>
            {Icon && iconPosition === 'left' && <Icon className={iconSize} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className={iconSize} />}
        </>
    );

    if ('href' in elementProps && elementProps.href !== undefined) {
        const { href, ...linkProps } = elementProps;
        return (
            <Link href={href} className={buttonClassName} {...linkProps}>
                {content}
            </Link>
        );
    }

    return (
        <button className={buttonClassName} {...elementProps}>
            {content}
        </button>
    );
}