'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { updateProfileAction } from '@/app/actions/profile';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Select } from '@/app/components/select';
import type { StaffProfileEditorData } from '@/lib/supabase-admin';

export function ProfileForm({ profile }: Readonly<{ profile: StaffProfileEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, null);
    const [campusId, setCampusId] = useState(String(profile.campusId));
    const coursesForCampus = profile.cursos.filter((course) => String(course.campusId) === campusId);
    const initialCourseAvailable = coursesForCampus.some((course) => course.id === profile.cursoId);
    const [courseId, setCourseId] = useState(
        initialCourseAvailable ? String(profile.cursoId) : String(coursesForCampus[0]?.id ?? ''),
    );

    return (
        <form action={formAction} className="mt-7 space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    label="Nome"
                    name="nome"
                    autoComplete="given-name"
                    defaultValue={profile.nome}
                    maxLength={200}
                    required
                />
                <Input
                    label="Sobrenome"
                    name="sobrenome"
                    autoComplete="family-name"
                    defaultValue={profile.sobrenome}
                    maxLength={200}
                />
                <Input
                    label="RA"
                    name="ra"
                    defaultValue={profile.ra}
                    maxLength={100}
                />
                <Input
                    label="URL da foto de perfil"
                    name="fotoPerfilUrl"
                    type="url"
                    defaultValue={profile.fotoPerfilUrl}
                    maxLength={2000}
                    helperText="Opcional. Use uma URL começando com http:// ou https://."
                />

                <Select
                    label="Campus"
                    name="campusId"
                    value={campusId}
                    options={profile.campi.map((campus) => ({
                        value: String(campus.id),
                        label: campus.nome,
                        campus,
                    }))}
                    onChange={(nextCampusId) => {
                        if (!nextCampusId) return;
                        const nextCourses = profile.cursos.find(
                            (course) => String(course.campusId) === nextCampusId,
                        );
                        setCampusId(nextCampusId);
                        setCourseId(String(nextCourses[0]?.id ?? ''));
                    }}
                    helperText="Só é possível escolher campi da sua instituição."
                    required
                />

                <Select
                    label="Curso"
                    name="cursoId"
                    value={courseId}
                    options={coursesForCampus.map((course) => ({
                        value: String(course.id),
                        label: course.nome,
                        course,
                    }))}
                    onChange={(nextCourseId) => setCourseId(nextCourseId ?? '')}
                    isDisabled={coursesForCampus.length === 0}
                    required
                    noOptionsMessage="Não há cursos cadastrados para este campus."
                />

                <Input
                    label="Ano de ingresso"
                    name="anoIngresso"
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 10}
                    defaultValue={profile.anoIngresso}
                    required
                />

                <Select
                    label="Semestre de ingresso"
                    name="semestreIngresso"
                    defaultValue={profile.semestreIngresso ? String(profile.semestreIngresso) : ''}
                    options={[
                        { value: '', label: 'Não informado' },
                        { value: '1', label: '1º semestre' },
                        { value: '2', label: '2º semestre' },
                    ]}
                />
            </div>

            {state?.error && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    {state.error}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <Link
                    href="/painel"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Voltar
                </Link>
                <Button type="submit" disabled={isPending || coursesForCampus.length === 0} icon={Save}>
                    {isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
            </div>
        </form>
    );
}
