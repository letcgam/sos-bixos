'use client';

import { useId, type ReactNode } from 'react';
import ReactSelect, {
    type FormatOptionLabelMeta,
    type GroupBase,
    type OptionsOrGroups,
} from 'react-select';
import type { InputSize, InputVariant } from './input';

export type SelectOption = {
    value: string;
    label: string;
    isDisabled?: boolean;
};

export interface SelectProps<Option extends SelectOption> {
    id?: string;
    name?: string;
    label?: string;
    helperText?: string;
    error?: string;
    success?: boolean;
    variant?: InputVariant;
    inputSize?: InputSize;
    className?: string;
    options: OptionsOrGroups<Option, GroupBase<Option>>;
    value?: string | null;
    defaultValue?: string;
    onChange?: (value: string | null, option: Option | null) => void;
    formatOptionLabel?: (option: Option, meta: FormatOptionLabelMeta<Option>) => ReactNode;
    formatGroupLabel?: (group: GroupBase<Option>) => ReactNode;
    placeholder?: string;
    noOptionsMessage?: string;
    isDisabled?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    isLoading?: boolean;
    required?: boolean;
}

function isOptionGroup<Option extends SelectOption>(
    item: Option | GroupBase<Option>,
): item is GroupBase<Option> {
    return 'options' in item && Array.isArray(item.options);
}

export function Select<Option extends SelectOption>({
    id,
    name,
    label,
    helperText,
    error,
    success,
    variant = 'default',
    inputSize = 'md',
    className = '',
    options,
    value,
    defaultValue,
    onChange,
    formatOptionLabel,
    formatGroupLabel,
    placeholder = 'Selecione...',
    noOptionsMessage = 'Nenhuma opção disponível.',
    isDisabled = false,
    isSearchable = false,
    isClearable = false,
    isLoading = false,
    required = false,
}: Readonly<SelectProps<Option>>) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const helperTextId = `${selectId}-helper`;
    const activeVariant: InputVariant = error
        ? 'error'
        : success
            ? 'success'
            : variant;
    const allOptions = options.flatMap((item) => (
        isOptionGroup(item) ? item.options : [item]
    ));
    const selectedValue = value === undefined ? defaultValue : value;
    const selectedOption = selectedValue == null
        ? null
        : allOptions.find((option) => option.value === selectedValue) ?? null;

    const borderStyles: Record<InputVariant, string> = {
        default: 'border-slate-300 dark:border-slate-700',
        error: 'border-red-500 dark:border-red-500',
        success: 'border-emerald-500 dark:border-emerald-500',
    };

    const controlHeights: Record<InputSize, string> = {
        sm: 'min-h-8 text-xs',
        md: 'min-h-10 text-sm',
        lg: 'min-h-12 text-base',
    };

    return (
        <div className={`flex w-full flex-col gap-1.5 break-inside-avoid ${className}`}>
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium select-none">
                    {label}
                </label>
            )}

            <ReactSelect<Option, false, GroupBase<Option>>
                inputId={selectId}
                instanceId={selectId}
                name={name}
                aria-invalid={Boolean(error)}
                aria-errormessage={error ? errorId : undefined}
                aria-describedby={error ? errorId : helperText ? helperTextId : undefined}
                required={required}
                isDisabled={isDisabled}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isLoading={isLoading}
                options={options}
                value={selectedOption}
                onChange={(option) => onChange?.(option?.value ?? null, option)}
                formatOptionLabel={formatOptionLabel}
                formatGroupLabel={formatGroupLabel}
                placeholder={placeholder}
                noOptionsMessage={() => noOptionsMessage}
                unstyled
                classNames={{
                    control: ({ isDisabled: controlDisabled, isFocused }) => [
                        'flex w-full items-center border bg-white transition-colors duration-150 dark:bg-neutral-900',
                        'focus:outline-none',
                        borderStyles[activeVariant],
                        controlHeights[inputSize],
                        'rounded-full',
                        isFocused && 'border-indigo-500 ring-2 ring-indigo-500',
                        controlDisabled && 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-neutral-800',
                    ].filter(Boolean).join(' '),
                    valueContainer: () => 'flex min-w-0 flex-1 items-center gap-1 px-3.5',
                    input: () => 'm-0 p-0 text-slate-900 dark:text-slate-100',
                    placeholder: () => 'text-slate-400',
                    singleValue: () => 'truncate text-slate-900 dark:text-slate-100',
                    indicatorsContainer: () => 'flex shrink-0 items-center pr-2 text-slate-400',
                    dropdownIndicator: () => 'flex cursor-pointer items-center px-1.5 py-2 hover:text-slate-700 dark:hover:text-slate-200',
                    clearIndicator: () => 'flex cursor-pointer items-center px-1.5 py-2 hover:text-red-600',
                    indicatorSeparator: () => 'my-2 w-px bg-slate-200 dark:bg-slate-700',
                    menu: () => 'absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-neutral-900',
                    menuList: () => 'max-h-60 overflow-y-auto py-1',
                    option: ({ isFocused, isSelected, isDisabled: optionDisabled }) => [
                        'cursor-pointer px-3.5 py-2 text-sm',
                        isSelected
                            ? 'bg-indigo-600 text-white'
                            : isFocused
                                ? 'bg-indigo-50 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-100'
                                : 'text-slate-800 dark:text-slate-200',
                        optionDisabled && 'cursor-not-allowed opacity-50',
                    ].filter(Boolean).join(' '),
                    groupHeading: () => 'px-3.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
                    noOptionsMessage: () => 'px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400',
                    loadingMessage: () => 'px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400',
                }}
            />

            {error ? (
                <p id={errorId} className="text-xs font-medium text-red-600 dark:text-red-400">
                    {error}
                </p>
            ) : helperText ? (
                <p id={helperTextId} className="text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
}
