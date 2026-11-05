'use client';

import { useActionState, useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { updateUnidadeAction } from '@/app/actions/unidade';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Select, type SelectOption } from '@/app/components/select';
import { Textarea } from '@/app/components/textarea';
import type { UnidadeEditorData } from '@/lib/supabase-admin';

export function UnidadeForm({
    unidade,
}: Readonly<{ unidade: UnidadeEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateUnidadeAction, null);
    const [estados, setEstados] = useState<SelectOption[]>([]);
    const [estado, setEstado] = useState(unidade.estado);
    const [estadosError, setEstadosError] = useState<string | null>(null);
    const [isLoadingEstados, setIsLoadingEstados] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadEstados() {
            try {
                const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados', {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`IBGE respondeu com status ${response.status}.`);
                }

                const data: unknown = await response.json();
                if (!Array.isArray(data)) {
                    throw new TypeError('A resposta do IBGE não contém uma lista de estados.');
                }

                const options = data.flatMap((item): SelectOption[] => {
                    if (
                        typeof item !== 'object'
                        || item === null
                        || !('sigla' in item)
                        || !('nome' in item)
                        || typeof item.sigla !== 'string'
                        || typeof item.nome !== 'string'
                    ) {
                        return [];
                    }

                    return [{ value: item.sigla, label: `${item.sigla} - ${item.nome}` }];
                });

                if (options.length === 0) {
                    throw new Error('O IBGE não retornou estados válidos.');
                }

                setEstados(options);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error('Failed to load Brazilian states from IBGE:', error);
                setEstadosError('Não foi possível carregar a lista de estados. Tente novamente mais tarde.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingEstados(false);
                }
            }
        }

        void loadEstados();
        return () => controller.abort();
    }, []);

    const estadoSelecionado = estados.find((option) => (
        option.value.toLocaleLowerCase() === estado.toLocaleLowerCase()
        || option.label.split(' - ').slice(1).join(' - ').toLocaleLowerCase() === estado.toLocaleLowerCase()
    ))?.value ?? null;

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
                    <Select
                        label="Estado"
                        name="estado"
                        options={estados}
                        value={estadoSelecionado}
                        onChange={(value) => setEstado(value ?? '')}
                        placeholder={isLoadingEstados ? 'Carregando estados...' : 'Selecione um estado'}
                        helperText="Lista fornecida pelo IBGE."
                        error={estadosError ?? undefined}
                        isLoading={isLoadingEstados}
                        isDisabled={isLoadingEstados || Boolean(estadosError) || isPending}
                    />
                    <Input
                        label="Cidade"
                        name="cidade"
                        defaultValue={unidade.cidade}
                        maxLength={150}
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
                <Button
                    type="submit"
                    disabled={isPending || isLoadingEstados || Boolean(estadosError)}
                    icon={Save}
                >
                    {isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
            </div>
        </form>
    );
}
