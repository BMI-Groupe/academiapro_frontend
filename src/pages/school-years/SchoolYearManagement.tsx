import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import schoolYearService from "../../api/services/schoolYearService";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface SchoolYearForm {
  label: string;
  year_start: string;
  year_end: string;
  is_active: boolean;
}

export default function SchoolYearManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchoolYears = async () => {
    setLoading(true);
    try {
      const res = await schoolYearService.list();
      console.log("School years", res);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const handleOpenCreate = () => {
    navigate("/school-years/new");
  };

  const handleEdit = (item: any) => {
    navigate(`/school-years/${item.id}/edit`);
  };

  const handleDelete = (item: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer l'année scolaire "${item.label}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await schoolYearService.remove(item.id);
          openModal({ title: "Succès", description: "Année scolaire supprimée.", variant: "success" });
          await fetchSchoolYears();
        } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Impossible de supprimer.", variant: "error" });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Années Scolaires" description="Gestion des années scolaires" />
      <PageBreadcrumb pageTitle="Années Scolaires" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">Années Scolaires</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez les années scolaires et définissez l'année active.</p>
          </div>
          <Button onClick={handleOpenCreate}>+ Nouvelle année</Button>
        </div>

        <DataTable
          columns={[
            { key: "label", label: "Libellé" },
            { key: "year_start", label: "Début" },
            { key: "year_end", label: "Fin" },
            { key: "is_active", label: "Active", render: (val: boolean) => (val ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Oui</span> : <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Non</span>) },
          ]}
          data={schoolYears}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
