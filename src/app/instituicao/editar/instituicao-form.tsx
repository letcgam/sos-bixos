'use client';

import Image from 'next/image';
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react';
import { updateInstituicaoAction } from '@/app/actions/instituicao';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import type { InstituicaoEditorData } from '@/lib/supabase-admin';

function InstitutionImageInput({
    name,
    label,
    currentUrl,
    isPending,
}: Readonly<{
    name: 'logo' | 'banner';
    label: string;
    currentUrl: string;
    isPending: boolean;
}>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setRemoveImage(false);
    }

    function handleRemoveImage() {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setPreviewUrl(null);
        setRemoveImage(true);
    }

    return (
        <div className="space-y-3">
            <label htmlFor={`${name}-image`} className="text-sm font-medium select-none">
                {label}
            </label>
            <input type="hidden" name={`remover${name === "logo" ? "Logo" : "Banner"}`} value={removeImage ? "true" : "false"} />
            <div className={`relative ${name === "logo" ? "aspect-square" : "aspect-4/1"} mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-neutral-900`}>
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt={`Prévia de ${label.toLocaleLowerCase()}`}
                        fill
                        unoptimized
                        sizes={name === "logo" ? "192px" : "(max-width: 640px) 100vw, 672px"}
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                        <ImagePlus aria-hidden="true" className="h-8 w-8" />
                        <span className="text-sm">Nenhuma imagem selecionada</span>
                    </div>
                )}
            </div>
            <div className="w-full flex flex-col gap-1.5">
                <input
                    ref={inputRef}
                    id={`${name}-image`}
                    name={name}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={isPending}
                    className="w-full min-h-10 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-neutral-900 dark:text-slate-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 dark:disabled:bg-neutral-800"
                />
                <p className="text-xs text-slate-500">PNG, JPG ou WebP; máximo de 10 MB.</p>
            </div>
            {previewUrl && (
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/50"
                >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remover imagem
                </button>
            )}
        </div>
    );
}

export function InstituicaoForm({
    instituicao,
}: Readonly<{ instituicao: InstituicaoEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateInstituicaoAction, null);

    return (
        <form action={formAction} className="mt-7 space-y-6">
            <div className="grid gap-5">
                <div className="flex justify-center">
                    <InstitutionImageInput
                        name="logo"
                        label="Logo da instituição"
                        currentUrl={instituicao.logoUrl}
                        isPending={isPending}
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                        label="Nome"
                        name="nome"
                        defaultValue={instituicao.nome}
                        maxLength={200}
                        required
                    />
                    <Input
                        label="Sigla"
                        name="sigla"
                        defaultValue={instituicao.sigla}
                        maxLength={50}
                    />
                </div>
                <Input
                    label="Site oficial"
                    name="siteOficial"
                    type="url"
                    inputMode="url"
                    placeholder="https://exemplo.edu.br"
                    helperText="Deixe em branco se não houver site oficial."
                    defaultValue={instituicao.siteOficial}
                    maxLength={2048}
                />
                <InstitutionImageInput
                    name="banner"
                    label="Banner da instituição"
                    currentUrl={instituicao.bannerUrl}
                    isPending={isPending}
                />
            </div>

            {state?.error && (
                <p
                    role="alert"
                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                >
                    {state.error}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <Button href="/instituicao" icon={ArrowLeft} variant="ghost">
                    Voltar
                </Button>
                <Button type="submit" disabled={isPending} icon={Save}>
                    {isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
            </div>
        </form>
    );
}
