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
      // On utilise list() car il est plus fiable et on filtre nous-même
      const res = await schoolYearService.list();
      
      if (res && res.success) {
        let items: any[] = [];
        
        // Gestion robuste structure API (similaire aux pages Management)
        if (Array.isArray(res.data)) {
           if (Array.isArray(res.data[0])) {
               items = res.data[0];
           } else {
               items = res.data;
           }
        } else if (res.data?.data) {
           items = res.data.data;
        }

        // Trouver l'année active (is_active === 1 ou true)
        // On vérifie les deux types (booléen ou entier)
        const active = items.find((y: any) => y.is_active === true || y.is_active === 1);

        if (active) {
            setActiveSchoolYear(active);
        } else {
            setActiveSchoolYear(null);
            // Pas une erreur critique, juste pas d'année active définie
        }
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error('Erreur contexte année:', err);
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
