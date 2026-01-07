import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import classroomService from "../../api/services/classroomService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";
import { TaskIcon } from "../../icons";
import useAuth from "../../providers/auth/useAuth";

export default function ClassroomManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { userInfo } = useAuth();
  // @ts-ignore
  const userRole = userInfo?.role;
  
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClassrooms = async (page = 1) => {
    setLoading(true);
    try {
      const res = await classroomService.list({ 
          school_year_id: selectedYear?.id,
          page: page,
          per_page: perPage,
          search: searchTerm
      });

      if (res && res.success) {
        let items: any[] = [];
        let meta: any = {};

        // Gestion normalisée de la pagination Laravel
        const responseData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (responseData && typeof responseData === 'object') {
             if (Array.isArray(responseData.data)) {
                 items = responseData.data;
                 meta = responseData; 
             } else {
                 items = Array.isArray(responseData) ? responseData : [];
             }
        } else {
             items = Array.isArray(res.data) ? res.data : [];
        }

        setClassrooms(items || []);
        
        if (meta.current_page) {
            setCurrentPage(meta.current_page);
            setTotalPages(meta.last_page);
            setTotalItems(meta.total);
            setPerPage(meta.per_page);
        } else {
            setCurrentPage(1);
            setTotalPages(1);
            setTotalItems(items.length);
        }
      } else {
        setClassrooms([]);
        setTotalItems(0);
      }
    } catch (e) {
      console.error(e);
      setClassrooms([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const res = await schoolYearService.list();
      if (res && res.success) {
        let items: any[] = [];
        
        // Gestion robuste de la structure de réponse
        if (Array.isArray(res.data)) {
           if (Array.isArray(res.data[0])) {
               items = res.data[0];
           } else {
               items = res.data;
           }
        } else if (res.data?.data) {
           items = res.data.data;
        }
        
        const uniqueItems = items.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        setSchoolYears(uniqueItems);

        // Initialiser l'année sélectionnée immédiatement
        if (!selectedYear && uniqueItems.length > 0) {
            const active = uniqueItems.find((y: any) => y.is_active);
            setSelectedYear(active || uniqueItems[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSchoolYears();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  // Recharger quand l'année change
  useEffect(() => {
    if (selectedYear) {
        fetchClassrooms(1);
    }
  }, [selectedYear, searchTerm]);

  const handlePageChange = (page: number) => {
      fetchClassrooms(page);
  };

  const handleNavigateToCreate = () => {
    navigate("/classrooms/new");
  };

  const handleNavigateToDetails = (classroom: any) => {
    navigate(`/classrooms/${classroom.id}`);
  };

  const handleNavigateToSubjects = (classroom: any) => {
    navigate(`/classrooms/${classroom.id}/subjects`);
  };

  const handleNavigateToEdit = (classroom: any) => {
    navigate(`/classrooms/${classroom.id}/edit`);
  };

  const handleDelete = (classroom: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer la classe "${classroom.name}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await classroomService.remove(classroom.id);
          openModal({
            title: "Succès",
            description: "Classe supprimée avec succès.",
            variant: "success",
          });
          await fetchClassrooms(currentPage);
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer la classe.",
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Gestion des Classes" description="Liste des classes" />
      <PageBreadcrumb pageTitle="Gestion des Classes" />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        {/* Header and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:items-end">
            <div className="w-full sm:w-64">
              <SchoolYearFilter
                value={selectedYear}
                onChange={setSelectedYear}
                years={schoolYears}
                loading={loading}
              />
            </div>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Rechercher (nom, niveau, code)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          
          {userRole !== 'enseignant' && (
            <Button onClick={handleNavigateToCreate} className="relative overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une classe
              </span>
              <span className="absolute inset-0 bg-warning-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
            </Button>
          )}
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nom" },
            { key: "level", label: "Niveau" },
            // { key: "capacity", label: "Capacité" },
            // {
            //   key: "program",
            //   label: "Programme",
            //   render: (_, item) => (
            //     <button
            //       onClick={(e) => {
            //         e.stopPropagation();
            //         handleNavigateToSubjects(item);
            //       }}
            //       className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            //     >
            //       <TaskIcon className="size-4" />
            //       <span className="text-xs font-medium">Gérer</span>
            //     </button>
            //   ),
            // },
          ]}
          data={classrooms}
          loading={loading}
          onView={handleNavigateToDetails}
          onEdit={userRole !== 'enseignant' ? handleNavigateToEdit : undefined}
          onDelete={userRole !== 'enseignant' ? handleDelete : undefined}
          
          pagination={{
              currentPage: currentPage,
              totalPages: totalPages,
              totalItems: totalItems,
              perPage: perPage,
              onPageChange: handlePageChange
          }}
        />
      </div>
    </>
  );
}
