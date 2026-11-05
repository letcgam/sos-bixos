import React, { useId } from 'react';
import type { InputSize, InputVariant } from './input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: boolean;
    variant?: InputVariant;
    inputSize?: InputSize;
    className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    helperText,
    error,
    success,
    variant = 'default',
    inputSize = 'md',
    className = '',
    id,
    rows = 4,
    disabled,
    ...props
}) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const activeVariant: InputVariant = error
        ? 'error'
        : success
            ? 'success'
            : variant;

    const variantStyles: Record<InputVariant, string> = {
        default: 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-100',
        error: 'border-red-500 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200',
        success: 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200',
    };

    const sizeStyles: Record<InputSize, string> = {
        sm: 'px-2.5 py-1.5 text-xs rounded-lg',
        md: 'px-3.5 py-2 text-sm rounded-xl',
        lg: 'px-4 py-3 text-base rounded-xl',
    };

    return (
        <div className="w-full flex flex-col gap-1.5 break-inside-avoid">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="text-sm font-medium select-none"
                >
                    {label}
                </label>
            )}

            <textarea
                id={textareaId}
                rows={rows}
                disabled={disabled}
                className={`w-full min-h-24 resize-y bg-white border transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:bg-neutral-900 dark:disabled:bg-neutral-800 dark:disabled:text-slate-500 ${variantStyles[activeVariant]} ${sizeStyles[inputSize]} ${className}`}
                {...props}
            />

            {error ? (
                <p className="text-xs text-red-600 font-medium">{error}</p>
            ) : helperText ? (
                <p className="text-xs text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
};