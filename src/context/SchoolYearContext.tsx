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
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Utiliser l'endpoint dédié pour récupérer l'année active
      const res = await schoolYearService.getActive();
      
      console.log('🔍 Active school year response:', res);
      
      if (res && res.success && res.data) {
        let activeYear: any = null;
        
        // Gestion de la structure de réponse API (format: { success: true, data: [year], message: '...' })
        if (Array.isArray(res.data)) {
          // Si c'est un tableau, prendre le premier élément
          if (res.data.length > 0) {
            activeYear = res.data[0];
          }
        } else if (res.data && typeof res.data === 'object') {
          // Si c'est un objet direct (peut arriver selon la structure)
          activeYear = res.data;
        }

        console.log('🔍 Parsed active year:', activeYear);

        if (activeYear && activeYear.id) {
          setActiveSchoolYear(activeYear);
          setError(null);
        } else {
          console.warn('🔍 No valid active year found in response');
          setActiveSchoolYear(null);
          setError('Aucune année scolaire active trouvée');
        }
      } else {
        // Pas d'année active (404 ou autre)
        console.warn('🔍 No success or data in response:', res);
        setActiveSchoolYear(null);
        setError(res?.message || 'Aucune année scolaire active trouvée');
      }
    } catch (err: any) {
      console.error('🔍 Error fetching active school year:', err);
      if (err?.response?.status === 404) {
        // 404 signifie qu'il n'y a pas d'année active, ce n'est pas une erreur critique
        setActiveSchoolYear(null);
        setError('Aucune année scolaire active trouvée');
      } else if (err?.response?.status !== 401) {
        console.error('Erreur contexte année:', err);
        setError('Erreur lors de la récupération de l\'année scolaire active');
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
