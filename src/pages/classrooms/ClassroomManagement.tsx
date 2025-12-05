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

export default function ClassroomManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await classroomService.list({ school_year_id: selectedYear?.id });
      // Normalize backend ApiResponse which wraps payload inside an array.
      // Expected shapes seen in API:
      // - { success: true, data: [ { data: [ ...items ], ...pag } ], message }
      // - or sometimes { success: true, data: [ ...items ] }
      if (res && res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          // If the first element is a paginator/resource with `data` key
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            // otherwise assume res.data is already the items array
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        setClassrooms(items || []);
      } else {
        setClassrooms([]);
      }
    } catch (e) {
      console.error(e);
      setClassrooms([]);
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
    fetchClassrooms();
  }, [selectedYear]);

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
          await fetchClassrooms();
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
          <Button onClick={handleNavigateToCreate}>+ Ajouter une classe</Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nom" },
            { key: "level", label: "Niveau" },
            { key: "capacity", label: "Capacité" },
            {
              key: "program",
              label: "Programme",
              render: (_, item) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToSubjects(item);
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <TaskIcon className="size-4" />
                  <span className="text-xs font-medium">Gérer</span>
                </button>
              ),
            },
          ]}
          data={classrooms}
          loading={loading}
          onView={handleNavigateToDetails}
          onEdit={handleNavigateToEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
