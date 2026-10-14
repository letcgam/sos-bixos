export type ProfileFunction = 'aluno' | 'moderador' | 'administrador';
export type StaffRole = Extract<ProfileFunction, 'moderador' | 'administrador'>;

export function isStaffRole(funcao: unknown): funcao is StaffRole {
    return funcao === 'administrador' || funcao === 'moderador';
}
