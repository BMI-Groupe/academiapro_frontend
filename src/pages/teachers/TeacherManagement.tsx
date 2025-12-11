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

  const fetchTeachers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await teacherService.list({ 
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
  }, []);

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
        <div className="flex justify-end items-center gap-4">
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
