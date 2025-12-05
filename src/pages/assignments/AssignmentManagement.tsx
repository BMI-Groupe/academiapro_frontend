import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import assignmentService from "../../api/services/assignmentService";
import { Assignment, Classroom, Subject } from "../../types";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function AssignmentManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = activeSchoolYear ? { school_year_id: activeSchoolYear.id } : {};
      const res = await assignmentService.list(params);
      if (res && res.success) {
        let items: Assignment[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data as Assignment[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        setAssignments(items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [activeSchoolYear]);

  const handleOpenCreateForm = () => {
    navigate("/assignments/new");
  };

  const handleOpenEditForm = (item: Assignment) => {
    navigate(`/assignments/edit?id=${item.id}`);
  };

  const handleDelete = (item: Assignment) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer le devoir "${item.title}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await assignmentService.remove(item.id);
          openModal({ title: "Succès", description: "Devoir supprimé.", variant: "success" });
          await fetchAssignments();
        } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Impossible de supprimer.", variant: "error" });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Devoirs & Évaluations" description="Gestion des devoirs et évaluations" />
      <PageBreadcrumb pageTitle="Devoirs & Évaluations" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">Devoirs & Évaluations</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les devoirs, évaluations et examens pour l'année scolaire{" "}
              {activeSchoolYear ? activeSchoolYear.label : ""}
            </p>
          </div>
          <Button onClick={handleOpenCreateForm}>+ Nouveau devoir</Button>
        </div>

        <DataTable
          columns={[
            { key: "title", label: "Titre" },
            {
              key: "evaluation_type",
              label: "Type",
              render: (val: any) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize">
                  {val?.name || "-"}
                </span>
              ),
            },
            {
              key: "classroom",
              label: "Classe",
              render: (val: Classroom) => val?.name || "-",
            },
            {
              key: "subject",
              label: "Matière",
              render: (val: Subject) => val?.name || "-",
            },
            { key: "max_score", label: "Note max" },
            { key: "due_date", label: "Échéance" },
          ]}
          data={assignments}
          loading={loading}
          onEdit={handleOpenEditForm}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
