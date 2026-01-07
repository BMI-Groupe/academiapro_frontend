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
import schoolYearService from "../../api/services/schoolYearService";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";
import useAuth from "../../providers/auth/useAuth";

export default function AssignmentManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { userInfo } = useAuth();
  // @ts-ignore
  const userRole = userInfo?.role;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAssignments = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
          school_year_id: selectedYear?.id,
          page: page,
          per_page: perPage,
          search: searchTerm
      };
      
      const res = await assignmentService.list(params);
      if (res && res.success) {
        let items: Assignment[] = [];
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

        setAssignments(items || []);
        
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
      }
    } catch (e) {
      console.error(e);
      setAssignments([]);
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
        
        // Auto-sélection
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
        fetchAssignments(1);
    }
  }, [selectedYear, searchTerm]);

  const handlePageChange = (page: number) => {
      fetchAssignments(page);
  };

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
          await fetchAssignments(currentPage);
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
        <ActiveSchoolYearAlert />

        {/* Header and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:items-end">
            <div className="w-full sm:w-64">
              <SchoolYearFilter
                value={selectedYear}
                onChange={setSelectedYear}
                years={schoolYears}
                loading={loading}
                showAll={true}
              />
            </div>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Rechercher (titre, classe, matière)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          
          {userRole !== 'enseignant' && (
            <Button onClick={handleOpenCreateForm} className="relative overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau devoir
              </span>
              <span className="absolute inset-0 bg-warning-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
            </Button>
          )}
        </div>

        <DataTable
          columns={[
            { key: "title", label: "Titre" },
            {
              key: "evaluation_type",
              label: "Type",
              render: (val: any) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize">
                  {val?.name || "Devoir"}
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
          onEdit={userRole !== 'enseignant' ? handleOpenEditForm : undefined}
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
