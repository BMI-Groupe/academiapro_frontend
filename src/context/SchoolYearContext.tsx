import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import schoolYearService from '../api/services/schoolYearService';

interface SchoolYear {
  id: number;
  year_start: number;
  year_end: number;
  label: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

interface SchoolYearContextType {
  activeSchoolYear: SchoolYear | null;
  loading: boolean;
  error: string | null;
  refreshActiveSchoolYear: () => Promise<void>;
}

const SchoolYearContext = createContext<SchoolYearContextType | undefined>(undefined);

export const SchoolYearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSchoolYear = async () => {
    // Ne pas charger si pas de token (utilisateur non connecté)
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await schoolYearService.getActive();
      if (res && res.success && res.data) {
        // Gérer la structure de réponse imbriquée
        let yearData = null;
        if (Array.isArray(res.data)) {
          if (res.data[0] && !Array.isArray(res.data[0])) {
            yearData = res.data[0];
          }
        } else {
          yearData = res.data;
        }
        setActiveSchoolYear(yearData);
      } else {
        setError('Aucune année scolaire active trouvée.');
      }
    } catch (err: any) {
      // Ne pas afficher d'erreur si c'est une erreur 401 (non authentifié)
      if (err?.response?.status !== 401) {
        console.error('Erreur lors du chargement de l\'année scolaire active:', err);
        setError(err?.response?.data?.message || 'Erreur lors du chargement de l\'année scolaire active.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSchoolYear();
  }, []);

  const refreshActiveSchoolYear = async () => {
    await fetchActiveSchoolYear();
  };

  return (
    <SchoolYearContext.Provider value={{ activeSchoolYear, loading, error, refreshActiveSchoolYear }}>
      {children}
    </SchoolYearContext.Provider>
  );
};

export const useActiveSchoolYear = (): SchoolYearContextType => {
  const context = useContext(SchoolYearContext);
  if (context === undefined) {
    throw new Error('useActiveSchoolYear must be used within a SchoolYearProvider');
  }
  return context;
};
