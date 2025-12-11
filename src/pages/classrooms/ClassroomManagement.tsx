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

  const fetchClassrooms = async (page = 1) => {
    setLoading(true);
    try {
      const res = await classroomService.list({ 
          school_year_id: selectedYear?.id,
          page: page,
          per_page: perPage 
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
  }, [selectedYear]);

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

        <div className="flex justify-between items-start gap-4">
          <SchoolYearFilter
            value={selectedYear}
            onChange={setSelectedYear}
            years={schoolYears}
            loading={loading}
            className="w-64"
          />
          {userRole !== 'enseignant' && (
            <Button onClick={handleNavigateToCreate}>+ Ajouter une classe</Button>
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
