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
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";

export default function StudentManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [students, setStudents] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.list({ school_year_id: selectedYear?.id });
      if (res && res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        setStudents(items || []);
      } else {
        setStudents([]);
      }
    } catch (e) {
      console.error(e);
      setStudents([]);
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
          // Check if the first element is a paginator object (has .data array)
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } 
          // Check if the first element is the array of items itself (non-paginated case)
          else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          }
          // Fallback: assume res.data is the list (though unlikely given the controller)
          else {
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        setSchoolYears(items || []);
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
    fetchStudents();
  }, [selectedYear]);

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
          await fetchStudents();
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
            className="w-64"
          />
          <Button onClick={handleNavigateToCreate}>+ Ajouter un élève</Button>
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
          onEdit={handleNavigateToEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
