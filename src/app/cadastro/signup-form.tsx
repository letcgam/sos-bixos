'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, UserRoundPlus, LogIn } from 'lucide-react';
import { signUpAction } from '@/app/actions/auth';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Select } from '@/app/components/select';
import type { StudentSignupOptions } from '@/lib/supabase-admin';

export function SignupForm({ options }: Readonly<{ options: StudentSignupOptions }>) {
    const [state, formAction, isPending] = useActionState(signUpAction, null);
    const [instituicaoId, setinstituicaoId] = useState('');
    const unidadesForUniversity = options.unidades.filter(
        (unidade) => String(unidade.instituicaoId) === instituicaoId,
    );
    const [unidadeId, setunidadeId] = useState('');
    const coursesForunidade = options.cursos.filter(
        (course) => String(course.unidadeId) === unidadeId,
    );
    const [courseId, setCourseId] = useState('');

    return (
        <form action={formAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    label="Nome"
                    name="nome"
                    autoComplete="given-name"
                    maxLength={200}
                    required
                    placeholder="Primeiro nome ou apelido"
                />
                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nome@exemplo.com"
                    icon={Mail}
                    required
                />
            </div>

            <hr className="my-6 border-t border-slate-400 dark:border-slate-600" />

            <div className="grid gap-4 sm:grid-cols-2">
                <Select
                    label="Instituição / Faculdade"
                    name="instituicaoId"
                    value={instituicaoId}
                    options={options.instituicoes.map((university) => ({
                        value: String(university.id),
                        label: university.nome,
                    }))}
                    onChange={(nextinstituicaoId) => {
                        setinstituicaoId(nextinstituicaoId ?? '');
                        setunidadeId('');
                        setCourseId('');
                    }}
                    placeholder="Selecione sua instituição"
                    required
                />
                <Select
                    label="unidade"
                    name="unidadeId"
                    value={unidadeId}
                    options={unidadesForUniversity.map((unidade) => ({
                        value: String(unidade.id),
                        label: unidade.nome,
                    }))}
                    isDisabled={!instituicaoId || unidadesForUniversity.length === 0}
                    onChange={(nextunidadeId) => {
                        if (!nextunidadeId) return;
                        const nextCourses = options.cursos.filter(
                            (course) => String(course.unidadeId) === nextunidadeId,
                        );
                        setunidadeId(nextunidadeId);
                        setCourseId(String(nextCourses[0]?.id ?? ''));
                    }}
                    placeholder="Selecione o unidade"
                    required
                />
                <Select
                    label="Curso"
                    name="cursoId"
                    value={courseId}
                    options={coursesForunidade.map((course) => ({
                        value: String(course.id),
                        label: course.nome,
                    }))}
                    onChange={(nextCourseId) => setCourseId(nextCourseId ?? '')}
                    isDisabled={!unidadeId || coursesForunidade.length === 0}
                    placeholder="Selecione o curso"
                    noOptionsMessage="Não há cursos cadastrados para este unidade."
                    required
                />
                <Input
                    label="Ano de ingresso"
                    name="anoIngresso"
                    type="number"
                    min={1900}
                    max={String(new Date().getFullYear() + 10)}
                    placeholder={String(new Date().getFullYear())}
                    required
                />
                <Select
                    label="Semestre de ingresso"
                    name="semestreIngresso"
                    defaultValue=""
                    options={[
                        { value: '', label: 'Não informado' },
                        { value: '1', label: '1º semestre' },
                        { value: '2', label: '2º semestre' },
                    ]}
                />
            </div>

            <hr className="my-6 border-t border-slate-400 dark:border-slate-600" />

            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    label="Senha"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    helperText="Use pelo menos 8 caracteres."
                    icon={KeyRound}
                    required
                />
                <Input
                    label="Confirmar senha"
                    name="passwordConfirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    icon={KeyRound}
                    required
                />
            </div>

            {state?.error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    {state.error}
                </p>
            )}

            {state?.success && (
                <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    {state.success}
                </p>
            )}

            <Button
                type="submit"
                size="lg"
                icon={UserRoundPlus}
                iconPosition="right"
                disabled={
                    isPending
                    || !instituicaoId
                    || !unidadeId
                    || options.instituicoes.length === 0
                    || coursesForunidade.length === 0
                }
                className="mt-4 w-full"
            >
                {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-sm mt-2 text-slate-600 dark:text-slate-400">
                <span>Já tem uma conta?</span>
                <Link href="/login" className="default-link flex gap-1">
                    Entrar
                    <LogIn className="h-[1.5em]"/>
                </Link>
            </div>
        </form>
    );
}
