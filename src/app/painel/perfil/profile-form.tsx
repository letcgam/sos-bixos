'use client';

import Image from 'next/image';
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, Pencil, Save, Trash2, UserRound } from 'lucide-react';
import { updateProfileAction } from '@/app/actions/profile';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Select } from '@/app/components/select';
import type { StaffProfileEditorData } from '@/lib/supabase-admin';

export function ProfileForm({ profile }: Readonly<{ profile: StaffProfileEditorData }>) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState(profile.fotoPerfilUrl);
    const [hasPhoto, setHasPhoto] = useState(Boolean(profile.fotoPerfilUrl || profile.temFotoPerfil));
    const [removePhoto, setRemovePhoto] = useState(false);
    const [campusId, setCampusId] = useState(String(profile.campusId));
    const coursesForCampus = profile.cursos.filter((course) => String(course.campusId) === campusId);
    const initialCourseAvailable = coursesForCampus.some((course) => course.id === profile.cursoId);
    const [courseId, setCourseId] = useState(
        initialCourseAvailable ? String(profile.cursoId) : String(coursesForCampus[0]?.id ?? ''),
    );

    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setPhotoPreview(URL.createObjectURL(file));
        setHasPhoto(true);
        setRemovePhoto(false);
    }

    function handleRemovePhoto() {
        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }
        setPhotoPreview(null);
        setHasPhoto(false);
        setRemovePhoto(true);
    }

    return (
        <form action={formAction} className="mt-7 space-y-7">
            <input
                type="hidden"
                name="removerFotoPerfil"
                value={removePhoto ? 'true' : 'false'}
            />
            <div className="flex flex-col items-center gap-3">
                <input
                    ref={photoInputRef}
                    type="file"
                    name="fotoPerfil"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="Selecionar foto de perfil"
                />
                <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isPending}
                    aria-label="Escolher uma nova foto de perfil"
                    className="group relative h-32 w-32 rounded-full bg-slate-200 text-slate-500 ring-4 ring-white transition hover:ring-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500 dark:bg-neutral-800 dark:text-slate-400 dark:ring-neutral-950 dark:hover:ring-indigo-900"
                >
                    {photoPreview ? (
                        <Image
                            src={photoPreview}
                            alt="Foto de perfil atual"
                            fill
                            unoptimized
                            sizes="128px"
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <UserRound aria-hidden="true" className="mx-auto h-16 w-16" />
                    )}
                    <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow dark:border-neutral-950 dark:bg-indigo-500">
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                    </span>
                </button>
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    Clique para editar a foto de perfil.<br/>
                    JPG, PNG ou WebP; máximo de 10 MB.
                </p>
                {profile.fotoPerfilError && !photoPreview && (
                    <output className="text-center text-xs text-amber-700 dark:text-amber-300">
                        {profile.fotoPerfilError}
                    </output>
                )}
                {hasPhoto && (
                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-300 dark:hover:bg-red-950/50"
                    >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Excluir imagem
                    </button>
                )}
            </div>

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
                        const nextCourses = profile.cursos.filter(
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
                <Button href="/painel" icon={ArrowLeft} variant="ghost">
                    Voltar
                </Button>
                <Button type="submit" disabled={isPending || coursesForCampus.length === 0} icon={Save}>
                    {isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
            </div>
        </form>
    );
}
