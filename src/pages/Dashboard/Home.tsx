import React, { useEffect, useState, useRef } from "react";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import SimpleChart from "../../components/ecommerce/SimpleChart";
import SchoolOverview from "../../components/school/SchoolOverview";
import CountsGrid from "../../components/school/CountsGrid";
import RecentEnrollments from "../../components/school/RecentEnrollments";
import UpcomingSchedules from "../../components/school/UpcomingSchedules";
import FinancialOverview from "../../components/school/FinancialOverview";
import EnrollmentsByYearChart from "../../components/school/EnrollmentsByYearChart";
import RevenueByYearChart from "../../components/school/RevenueByYearChart";
import PageMeta from "../../components/common/PageMeta";
import FadeIn from "../../components/common/FadeIn";
import { CalenderIcon, ChevronDownIcon, CheckCircleIcon } from "../../icons";
import useAuth from "../../providers/auth/useAuth.ts";
import dashboardService from "../../api/services/dashboardService";
import schoolYearService from "../../api/services/schoolYearService";

export default function Home() {
  // @ts-ignore
  const { userInfo, authMe } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [activeYear, setActiveYear] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo?.id) {
        authMe(userInfo.id);
    }
  }, [userInfo?.id]);

  // Charger les années scolaires au montage
  useEffect(() => {
      loadSchoolYears();
  }, []);

  // Recharger les stats quand l'année change
  useEffect(() => {
     loadStats();
  }, [selectedYearId]);

  const loadSchoolYears = async () => {
      try {
          const res = await schoolYearService.list();
          // Gestion robuste de la réponse API (tableau direct vs pagination vs enveloppe data)
          // console.log(res);
          let yearsData: any[] = [];
          
          if (Array.isArray(res)) {
              yearsData = res;
          } else if (Array.isArray(res?.data)) {
              yearsData = res.data[0];
          } else if (Array.isArray(res?.data?.data)) {
              yearsData = res.data.data;
          }

          if (yearsData.length > 0) {
              // Filtrer les doublons éventuels par ID pour éviter l'avertissement React "unique key"
              const uniqueYears = yearsData.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
              setSchoolYears(uniqueYears);
              
              // Initialiser la sélection si pas encore faite
              if (!selectedYearId) {
                  const active = uniqueYears.find((sy: any) => sy.is_active);
                  if (active) {
                      setSelectedYearId(active.id);
                  } else if (uniqueYears.length > 0) {
                      setSelectedYearId(uniqueYears[0].id);
                  }
              }
          }
      } catch (error) {
          console.error("Erreur chargement années scolaires:", error);
      }
  };

  const loadStats = async () => {
      setLoading(true);
      try {
          const res = await dashboardService.getStats(selectedYearId);
          console.log("Réponse complète dashboard:", res);
          if (res?.success && res?.data) {
              console.log("Données dashboard:", res.data);
              console.log("Toutes les clés:", Object.keys(res.data));
              console.log("Financial stats:", res.data.financial_stats);
              console.log("Enrollments by year:", res.data.enrollments_by_year);
              console.log("Revenue by year:", res.data.revenue_by_year);
              
              // S'assurer que toutes les données sont présentes
              const statsData = {
                  ...res.data,
                  financial_stats: res.data.financial_stats || {},
                  enrollments_by_year: res.data.enrollments_by_year || [],
                  revenue_by_year: res.data.revenue_by_year || [],
              };
              
              setStats(statsData);
              
              // Gérer active_year qui peut être dans un tableau ou directement
              let activeYearData = res.data.active_year;
              if (Array.isArray(activeYearData) && activeYearData.length > 0) {
                  activeYearData = activeYearData[0];
              }
              setActiveYear(activeYearData);
              
              // Si aucune année sélectionnée au départ, synchroniser avec celle retournée par l'API
              if (!selectedYearId && activeYearData) {
                  setSelectedYearId(activeYearData.id);
              }
          } else {
              console.warn("Réponse invalide:", res);
          }
      } catch (error) {
          console.error("Erreur chargement statistiques:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newVal = parseInt(e.target.value);
      if (!isNaN(newVal)) {
        setSelectedYearId(newVal);
      }
  };

  const selectedYear = schoolYears.find(y => y.id === selectedYearId);

  return (
    <>
      <PageMeta
        title="Tableau de bord | AcademiaPro"
        description="Vue d'ensemble et statistiques de l'école"
      />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Tableau de bord
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
             Bienvenue, <span className="font-medium text-gray-700 dark:text-gray-300">{userInfo?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CalenderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Année scolaire</span>
            </div>
            <div className="relative group">
                {/* Selected value display with custom styling */}
                <div className="relative">
                  <select
                      value={selectedYearId || ''}
                      onChange={handleYearChange}
                      disabled={loading}
                      className="relative z-20 appearance-none rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-4 pr-10 outline-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-800 dark:text-white/90 min-w-[220px] cursor-pointer shadow-sm hover:shadow-md"
                  >
                      {loading && schoolYears.length === 0 && (
                        <option value="">Chargement...</option>
                      )}
                      {schoolYears.map((year) => (
                          <option 
                            key={year.id} 
                            value={year.id} 
                            className="dark:bg-gray-900 py-2"
                          >
                              {year.label} {year.is_active ? '✓' : ''}
                          </option>
                      ))}
                  </select>
                  
                  {/* Custom dropdown icon with animation */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-all duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-focus-within:rotate-180" />
                  </div>
                  
                  {/* Active badge indicator */}
                  {selectedYear?.is_active && (
                    <div className="absolute -top-2 -right-2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Active
                      </span>
                    </div>
                  )}
                  
                  {/* Hover effect background */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/30 group-hover:to-pink-50/30 dark:group-hover:from-blue-900/10 dark:group-hover:via-purple-900/10 dark:group-hover:to-pink-900/10 transition-all duration-300 pointer-events-none -z-10 rounded-lg"></div>
                </div>
                
                {/* Info tooltip for selected year */}
                {selectedYear && (
                  <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{selectedYear.label}</span>
                    </div>
                    {selectedYear.start_date && selectedYear.end_date && (
                      <p className="mt-1 text-gray-500 dark:text-gray-500">
                        Du {new Date(selectedYear.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {new Date(selectedYear.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <FadeIn delay={0} className="col-span-12 xl:col-span-5">
          <SchoolOverview activeYear={activeYear} loading={loading} />
        </FadeIn>

        <FadeIn delay={100} className="col-span-12 xl:col-span-7">
          <CountsGrid stats={stats?.counts} loading={loading} />
        </FadeIn>

        {/* Section Inscriptions */}
        <FadeIn delay={200} className="col-span-12 xl:col-span-5">
           <RecentEnrollments enrollments={stats?.recent_enrollments} loading={loading} />
        </FadeIn>
        
        <FadeIn delay={300} className="col-span-12 xl:col-span-7">
           <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Évolution des Inscriptions</h4>
                </div>
                <div className="flex-1 min-h-0">
                     <SimpleChart data={stats?.charts?.enrollments} loading={loading} height={300} />
                </div>
           </div>
        </FadeIn>

        {/* Section Financière - Séparée comme demandé */}
        <FadeIn delay={400} className="col-span-12">
            <FinancialOverview 
                financialStats={stats?.financial_stats} 
                chartData={stats?.charts?.finances} 
                loading={loading} 
            />
        </FadeIn>

        {/* Statistiques par année */}
        <FadeIn delay={500} className="col-span-12 xl:col-span-6">
          <EnrollmentsByYearChart 
            data={stats?.enrollments_by_year} 
            loading={loading} 
          />
        </FadeIn>

        <FadeIn delay={600} className="col-span-12 xl:col-span-6">
          <RevenueByYearChart 
            data={stats?.revenue_by_year} 
            loading={loading} 
          />
        </FadeIn>

        <FadeIn delay={700} className="col-span-12">
          <UpcomingSchedules schedules={stats?.upcoming_schedules} loading={loading} />
        </FadeIn>
      </div>
    </>
  );
}
