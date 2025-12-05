import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import teacherService from "../../api/services/teacherService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";

export default function TeacherManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherService.list({ school_year_id: selectedYear?.id });
      if (res.success) {
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

        setTeachers(items || []);
      } else {
        setTeachers([]);
      }
    } catch (e) {
      console.error(e);
      setTeachers([]);
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
    fetchTeachers();
  }, [selectedYear]);

  const handleNavigateToCreate = () => {
    navigate("/teachers/new");
  };

  const handleNavigateToDetails = (teacher: any) => {
    navigate(`/teachers/${teacher.id}/details`);
  };

  const handleNavigateToEdit = (teacher: any) => {
    navigate(`/teachers/${teacher.id}/edit`);
  };

  const handleDelete = (teacher: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer l'enseignant "${teacher.first_name} ${teacher.last_name}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await teacherService.remove(teacher.id);
          openModal({
            title: "Succès",
            description: "Enseignant supprimé avec succès.",
            variant: "success",
          });
          await fetchTeachers();
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer l'enseignant.",
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Gestion des Enseignants" description="Liste des enseignants" />
      <PageBreadcrumb pageTitle="Gestion des Enseignants" />

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
          <Button onClick={handleNavigateToCreate}>+ Ajouter un enseignant</Button>
        </div>

        <DataTable
          columns={[
            { key: "matricule", label: "Matricule" },
            { key: "first_name", label: "Prénom" },
            { key: "last_name", label: "Nom" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Téléphone" },
          ]}
          data={teachers}
          loading={loading}
          onView={handleNavigateToDetails}
          onEdit={handleNavigateToEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
