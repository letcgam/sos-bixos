'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Home, KeyRound, Mail, UserRoundPlus, LogIn } from 'lucide-react';
import { signUpAction } from '@/app/actions/auth';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Select } from '@/app/components/select';
import type { StudentSignupOptions } from '@/lib/supabase-admin';

export function SignupForm({ options }: Readonly<{ options: StudentSignupOptions }>) {
    const [state, formAction, isPending] = useActionState(signUpAction, null);
    const [universidadeId, setUniversidadeId] = useState('');
    const campusesForUniversity = options.campi.filter(
        (campus) => String(campus.universidadeId) === universidadeId,
    );
    const [campusId, setCampusId] = useState('');
    const coursesForCampus = options.cursos.filter(
        (course) => String(course.campusId) === campusId,
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
                    name="universidadeId"
                    value={universidadeId}
                    options={options.universidades.map((university) => ({
                        value: String(university.id),
                        label: university.nome,
                    }))}
                    onChange={(nextUniversidadeId) => {
                        setUniversidadeId(nextUniversidadeId ?? '');
                        setCampusId('');
                        setCourseId('');
                    }}
                    placeholder="Selecione sua instituição"
                    required
                />
                <Select
                    label="Campus"
                    name="campusId"
                    value={campusId}
                    options={campusesForUniversity.map((campus) => ({
                        value: String(campus.id),
                        label: campus.nome,
                    }))}
                    isDisabled={!universidadeId || campusesForUniversity.length === 0}
                    onChange={(nextCampusId) => {
                        if (!nextCampusId) return;
                        const nextCourses = options.cursos.filter(
                            (course) => String(course.campusId) === nextCampusId,
                        );
                        setCampusId(nextCampusId);
                        setCourseId(String(nextCourses[0]?.id ?? ''));
                    }}
                    placeholder="Selecione o campus"
                    required
                />
                <Select
                    label="Curso"
                    name="cursoId"
                    value={courseId}
                    options={coursesForCampus.map((course) => ({
                        value: String(course.id),
                        label: course.nome,
                    }))}
                    onChange={(nextCourseId) => setCourseId(nextCourseId ?? '')}
                    isDisabled={!campusId || coursesForCampus.length === 0}
                    placeholder="Selecione o curso"
                    noOptionsMessage="Não há cursos cadastrados para este campus."
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
                    || !universidadeId
                    || !campusId
                    || options.universidades.length === 0
                    || coursesForCampus.length === 0
                }
                className="mt-4 w-full"
            >
                {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-sm mt-2 text-slate-600 dark:text-slate-400">
                <span>Já tem uma conta?</span>
                <Link href="/login" className="font-medium text-indigo-700 underline underline-offset-4 dark:text-indigo-300 flex gap-1">
                    Entrar
                    <LogIn className="h-[1.5em]"/>
                </Link>
            </div>
            <div className="text-center">
                <Button href="/" variant="ghost">
                    <Home aria-hidden="true" className="h-4 w-4" />
                    Página inicial
                </Button>
            </div>
        </form>
    );
}
