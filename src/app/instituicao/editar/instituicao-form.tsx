'use client';

import { useActionState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { updateInstituicaoAction } from '@/app/actions/instituicao';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import type { InstituicaoEditorData } from '@/lib/supabase-admin';

export function InstituicaoForm({
    instituicao,
}: Readonly<{ instituicao: InstituicaoEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateInstituicaoAction, null);

    return (
        <form action={formAction} className="mt-7 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    label="Nome da instituição"
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
                <Input
                    label="URL do logo"
                    name="logoUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://exemplo.edu.br/logo.png"
                    helperText="Deixe em branco para remover o logo."
                    defaultValue={instituicao.logoUrl}
                    maxLength={2048}
                />
                <div className="sm:col-span-2">
                    <Input
                        label="URL do banner"
                        name="bannerUrl"
                        type="url"
                        inputMode="url"
                        placeholder="https://exemplo.edu.br/banner.png"
                        helperText="Deixe em branco para remover o banner."
                        defaultValue={instituicao.bannerUrl}
                        maxLength={2048}
                    />
                </div>
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
