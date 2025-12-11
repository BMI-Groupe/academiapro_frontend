import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import studentService from "../../api/services/studentService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import useAuth from "../../providers/auth/useAuth";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";

export default function StudentManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  // @ts-ignore
  const { userInfo } = useAuth();
  const isTeacher = userInfo?.role === 'enseignant';
  const { activeSchoolYear } = useActiveSchoolYear();
  
  const [students, setStudents] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await studentService.list({ 
          school_year_id: selectedYear?.id,
          page: page,
          per_page: perPage 
      });

      if (res && res.success) {
        let items: any[] = [];
        let meta: any = {};

        // Gestion de la pagination Laravel
        // res.data peut être enveloppé dans un tableau ou directement l'objet paginator
        const responseData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (responseData && typeof responseData === 'object') {
             // Si pagination standard Laravel
             if (Array.isArray(responseData.data)) {
                 items = responseData.data;
                 meta = responseData; // Contient current_page, last_page, total, etc.
             } else {
                 // Fallback si pas de pagination
                 items = Array.isArray(responseData) ? responseData : [];
             }
        } else {
             items = Array.isArray(res.data) ? res.data : [];
        }

        setStudents(items || []);
        
        // Mise à jour des infos de pagination
        if (meta.current_page) {
            setCurrentPage(meta.current_page);
            setTotalPages(meta.last_page);
            setTotalItems(meta.total);
            setPerPage(meta.per_page);
        } else {
            // Reset si pas de pagination
            setCurrentPage(1);
            setTotalPages(1);
            setTotalItems(items.length);
        }
      } else {
        setStudents([]);
        setTotalItems(0);
      }
    } catch (e) {
      console.error(e);
      setStudents([]);
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
        
        // Gestion robuste de la structure de réponse (tableau imbriqué)
        // L'API retourne souvent [ [year1, year2] ] donc on doit accéder à l'index 0
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

        // Initialiser l'année sélectionnée si aucune n'est définie
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

  // Synchronisation avec le contexte si disponible (backup)
  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  // Chargement des étudiants
  useEffect(() => {
    if (selectedYear) {
        fetchStudents(1);
    }
  }, [selectedYear]);

  const handlePageChange = (page: number) => {
      fetchStudents(page);
  };

  const handleNavigateToCreate = () => {
    navigate("/students/new");
  };

  const handleNavigateToDetails = (student: any) => {
    navigate(`/students/${student.id}`);
  };

  const handleNavigateToEdit = (student: any) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleDelete = (student: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer l'élève "${student.first_name} ${student.last_name}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await studentService.remove(student.id);
          openModal({
            title: "Succès",
            description: "Élève supprimé avec succès.",
            variant: "success",
          });
          // Recharger la page courante
          await fetchStudents(currentPage);
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer l'élève.",
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Gestion des Élèves" description="Liste des élèves" />
      <PageBreadcrumb pageTitle="Gestion des Élèves" />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        <div className="flex justify-between items-start gap-4">
          <SchoolYearFilter
            value={selectedYear}
            onChange={setSelectedYear}
            years={schoolYears}
            loading={loading}
            showAll={true}
            className="w-64"
          />
          {!isTeacher && <Button onClick={handleNavigateToCreate}>+ Ajouter un élève</Button>}
        </div>

        <DataTable
          columns={[
            { key: "matricule", label: "Matricule" },
            { key: "first_name", label: "Prénom" },
            { key: "last_name", label: "Nom" },
            { key: "birth_date", label: "Date de naissance" },
            { key: "gender", label: "Genre" },
          ]}
          data={students}
          loading={loading}
          onView={handleNavigateToDetails}
          onEdit={!isTeacher ? handleNavigateToEdit : undefined}
          onDelete={!isTeacher ? handleDelete : undefined}
          
          // Pagination
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
