import React, { useEffect, useState } from "react";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import SchoolOverview from "../../components/school/SchoolOverview";
import CountsGrid from "../../components/school/CountsGrid";
import RecentEnrollments from "../../components/school/RecentEnrollments";
import UpcomingSchedules from "../../components/school/UpcomingSchedules";
import FinancialOverview from "../../components/school/FinancialOverview";
import PageMeta from "../../components/common/PageMeta";
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
          if (res.data?.success) {
              setStats(res.data.data);
              setActiveYear(res.data.data.active_year);
              
              // Si aucune année sélectionnée au départ, synchroniser avec celle retournée par l'API
              if (!selectedYearId && res.data.data.active_year) {
                  setSelectedYearId(res.data.data.active_year.id);
              }
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

  return (
    <>
      <PageMeta
        title="Tableau de bord | AcademiaPro"
        description="Vue d'ensemble et statistiques de l'école"
      />
      
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Tableau de bord
          </h2>
          <p className="text-sm text-gray-500 mt-1">
             Bienvenue, {userInfo?.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Année scolaire :
            </label>
            <div className="relative">
                <select
                    value={selectedYearId || ''}
                    onChange={handleYearChange}
                    disabled={loading}
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-white py-2 px-4 pr-8 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input sm:w-auto"
                >
                    {schoolYears.length === 0 && <option value="">Chargement...</option>}
                    {schoolYears.map((year) => (
                        <option key={year.id} value={year.id}>
                            {year.label} {year.is_active ? '(Active)' : ''}
                        </option>
                    ))}
                </select>
                <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.8">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                        fill=""
                      ></path>
                    </g>
                  </svg>
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-5">
          <SchoolOverview activeYear={activeYear} loading={loading} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <CountsGrid stats={stats?.counts} loading={loading} />
        </div>

        {/* Section Inscriptions */}
        <div className="col-span-12 xl:col-span-5">
           <RecentEnrollments enrollments={stats?.recent_enrollments} loading={loading} />
        </div>
        
        <div className="col-span-12 xl:col-span-7">
           <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Évolution des Inscriptions</h4>
                <div className="h-[300px]">
                     <StatisticsChart data={stats?.charts?.enrollments} loading={loading} />
                </div>
           </div>
        </div>

        {/* Section Financière - Séparée comme demandé */}
        <div className="col-span-12">
            <FinancialOverview 
                financialStats={stats?.financial_stats} 
                chartData={stats?.charts?.finances} 
                loading={loading} 
            />
        </div>

        <div className="col-span-12">
          <UpcomingSchedules schedules={stats?.upcoming_schedules} loading={loading} />
        </div>
      </div>
    </>
  );
}
