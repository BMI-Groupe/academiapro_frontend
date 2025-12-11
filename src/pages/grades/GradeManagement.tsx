import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import gradeService from "../../api/services/gradeService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";
import useAuth from "../../providers/auth/useAuth";

export default function GradeManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  // @ts-ignore
  const { userInfo } = useAuth();
  const isTeacher = userInfo?.role === 'enseignant';
  const { activeSchoolYear } = useActiveSchoolYear();
  
  const [grades, setGrades] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const fetchGrades = async (page = 1) => {
    setLoading(true);
    try {
      const res = await gradeService.list({ 
         school_year_id: selectedYear?.id,
         page: page,
         per_page: perPage
      });

      if (res && res.success) {
        let items: any[] = [];
        let meta: any = {};

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

        setGrades(items || []);

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
        setGrades([]);
        setTotalItems(0);
      }
    } catch (e) {
      console.error(e);
      setGrades([]);
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

  useEffect(() => {
    if (selectedYear) {
      fetchGrades(1);
    }
  }, [selectedYear]);

  const handlePageChange = (page: number) => {
      fetchGrades(page);
  };

  const handleNavigateToCreate = () => {
    navigate("/grades/new");
  };

  const handleNavigateToEdit = (grade: any) => {
    navigate(`/grades/edit?id=${grade.id}`);
  };

  const handleDelete = (grade: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer cette note ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await gradeService.remove(grade.id);
          openModal({
            title: "Succès",
            description: "Note supprimée avec succès.",
            variant: "success",
          });
          await fetchGrades(currentPage);
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer la note.",
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Gestion des notes"
        description="Gestion des notes des élèves"
      />
      <PageBreadcrumb pageTitle="Gestion des notes" />

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
          <div className="flex-1 flex justify-between items-center">
            <div>
                 {/* Titre optionnel si l'espace le permet */}
            </div>
            <Button onClick={handleNavigateToCreate}>+ Ajouter une note</Button>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: "student",
              label: "Élève",
              render: (value: any) =>
                value ? `${value.first_name} ${value.last_name}` : "-",
            },
            {
              key: "assignment",
              label: "Examen",
              render: (value: any) => value?.title || "-",
            },
            { 
               key: "score", 
               label: "Score",
               render: (val: number, item: any) => (
                   <span className={`font-bold ${val < 10 ? 'text-red-500' : 'text-green-600'}`}>
                       {val}/{item.assignment?.max_score || 20}
                   </span>
               )
            },
            { 
                key: "graded_at", 
                label: "Date",
                render: (val: string) => val ? new Date(val).toLocaleDateString() : '-'
            },
          ]}
          data={grades}
          loading={loading}
          onEdit={!isTeacher ? handleNavigateToEdit : undefined}
          onDelete={!isTeacher ? handleDelete : undefined}
          
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
