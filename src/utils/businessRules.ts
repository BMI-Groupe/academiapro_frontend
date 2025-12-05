/**
 * Règles métier et validations côté client
 */

import { useActiveSchoolYear } from '../context/SchoolYearContext';

/**
 * Vérifie si une année scolaire active existe
 */
export const useRequiresActiveSchoolYear = () => {
    const { activeSchoolYear, loading } = useActiveSchoolYear();

    return {
        hasActiveYear: !!activeSchoolYear,
        loading,
        activeYear: activeSchoolYear,
    };
};

/**
 * Vérifie si l'utilisateur peut créer des devoirs (directeur uniquement)
 */
export const canCreateAssignment = (userRole?: string): boolean => {
    return userRole === 'directeur';
};

/**
 * Vérifie si l'utilisateur peut saisir des notes (enseignant ou directeur)
 */
export const canGradeAssignment = (userRole?: string): boolean => {
    return userRole === 'enseignant' || userRole === 'directeur';
};

/**
 * Vérifie si l'utilisateur est un directeur
 */
export const isDirector = (userRole?: string): boolean => {
    return userRole === 'directeur';
};

/**
 * Vérifie si l'utilisateur est un enseignant
 */
export const isTeacher = (userRole?: string): boolean => {
    return userRole === 'enseignant';
};

/**
 * Vérifie si l'utilisateur est un élève
 */
export const isStudent = (userRole?: string): boolean => {
    return userRole === 'eleve';
};

/**
 * Messages d'erreur pour les validations
 */
export const ValidationMessages = {
    NO_ACTIVE_YEAR: 'Une année scolaire active doit être définie avant de créer cette ressource.',
    NOT_DIRECTOR: 'Seul le directeur peut effectuer cette action.',
    NOT_TEACHER: 'Seul un enseignant peut effectuer cette action.',
    NOT_AUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
};
