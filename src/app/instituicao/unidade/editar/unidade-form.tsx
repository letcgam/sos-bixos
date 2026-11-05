'use client';

import { useActionState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { updateUnidadeAction } from '@/app/actions/unidade';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Textarea } from '@/app/components/textarea';
import type { UnidadeEditorData } from '@/lib/supabase-admin';

export function UnidadeForm({
    unidade,
}: Readonly<{ unidade: UnidadeEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateUnidadeAction, null);

    return (
        <form action={formAction} className="mt-7 space-y-6">
            <div className="grid gap-5">
                <Input
                    label="Nome"
                    name="nome"
                    defaultValue={unidade.nome}
                    maxLength={200}
                    required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                        label="Cidade"
                        name="cidade"
                        defaultValue={unidade.cidade}
                        maxLength={150}
                    />
                    <Input
                        label="Estado"
                        name="estado"
                        defaultValue={unidade.estado}
                        maxLength={100}
                    />
                </div>
                <Textarea
                    label="Endereço"
                    name="endereco"
                    defaultValue={unidade.endereco}
                    maxLength={1000}
                />
                <Input
                    label="URL do logo"
                    name="logoUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://exemplo.edu.br/logo.png"
                    helperText="Deixe em branco se não houver logo."
                    defaultValue={unidade.logoUrl}
                    maxLength={2048}
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
