import React from 'react';
import { useActiveSchoolYear } from '../../context/SchoolYearContext';

export default function ActiveSchoolYearAlert() {
  const { activeSchoolYear, loading, error } = useActiveSchoolYear();

  if (loading) {
    return null; // Ne rien afficher pendant le chargement
  }

  if (!activeSchoolYear || error) {
    return (
      <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start">
          <svg
            className="mr-3 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Aucune année scolaire active
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
              Une année scolaire active doit être définie avant de pouvoir créer des classes, inscrire des élèves ou créer des devoirs.
              Veuillez créer une année scolaire et la marquer comme active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start">
        <svg
          className="mr-3 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
            Année scolaire active : {activeSchoolYear.label}
          </h3>
          <p className="mt-1 text-sm text-green-700 dark:text-green-500">
            {activeSchoolYear.start_date && activeSchoolYear.end_date
              ? `Du ${new Date(activeSchoolYear.start_date).toLocaleDateString('fr-FR')} au ${new Date(activeSchoolYear.end_date).toLocaleDateString('fr-FR')}`
              : `Année ${activeSchoolYear.year_start}-${activeSchoolYear.year_end}`}
          </p>
        </div>
      </div>
    </div>
  );
}
