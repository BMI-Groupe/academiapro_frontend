import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import teacherService from "../../api/services/teacherService";

export default function TeacherManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTeachers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await teacherService.list({ 
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
                 meta = responseData; // current_page, last_page, total, etc.
             } else {
                 items = Array.isArray(responseData) ? responseData : [];
             }
        } else {
             items = Array.isArray(res.data) ? res.data : [];
        }

        setTeachers(items || []);
        
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
        setTeachers([]);
        setTotalItems(0);
      }
    } catch (e) {
      console.error(e);
      setTeachers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
      fetchTeachers(page);
  };

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
          await fetchTeachers(currentPage);
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
        {/* Header and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher (nom, prénom, matricule, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          
          <Button onClick={handleNavigateToCreate} className="relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un enseignant
            </span>
            <span className="absolute inset-0 bg-warning-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "first_name", label: "Prénom" },
            { key: "last_name", label: "Nom" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Téléphone" },
            { key: "specialization", label: "Spécialisation" },
          ]}
          data={teachers}
          loading={loading}
          onView={handleNavigateToDetails}
          onEdit={handleNavigateToEdit}
          onDelete={handleDelete}
          
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
