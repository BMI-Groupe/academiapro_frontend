import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import resourceService, { PedagogicalResource } from "../../api/services/resourceService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import schoolYearService from "../../api/services/schoolYearService";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";
import useAuth from "../../providers/auth/useAuth";
import classroomService from "../../api/services/classroomService";
import subjectService from "../../api/services/subjectService";

export default function ResourceManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { userInfo } = useAuth();
  // @ts-ignore
  const userRole = userInfo?.role;
  
  const [resources, setResources] = useState<PedagogicalResource[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  
  const [selectedType, setSelectedType] = useState<string>("");

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params: any = {
        school_year_id: selectedYear?.id,
      };
      
      if (selectedSection) params.section_id = selectedSection.id;
      if (selectedSubject) params.subject_id = selectedSubject.id;
      if (selectedType) params.type = selectedType;
      
      const res = await resourceService.getAll(params);
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        setResources(items);
      }
    } catch (e) {
      console.error(e);
      setResources([]);
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

  const loadSections = async () => {
    try {
      const res = await classroomService.list({ school_year_id: selectedYear?.id });
      if (res && res.success) {
        let items: any[] = [];
        
        // res.data est un tableau avec un objet de pagination
        if (Array.isArray(res.data) && res.data.length > 0) {
          const paginationData = res.data[0];
          // Les vraies données sont dans paginationData.data
          if (paginationData && Array.isArray(paginationData.data)) {
            items = paginationData.data;
          }
        }
        
        setSections(items);
      }
    } catch (e) {
      console.error('Erreur chargement sections:', e);
      setSections([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectService.list();
      if (res && res.success) {
        let items: any[] = [];
        
        // res.data est un tableau avec un objet de pagination
        if (Array.isArray(res.data) && res.data.length > 0) {
          const paginationData = res.data[0];
          // Les vraies données sont dans paginationData.data
          if (paginationData && Array.isArray(paginationData.data)) {
            items = paginationData.data;
          }
        }
        
        setSubjects(items);
      }
    } catch (e) {
      console.error('Erreur chargement matières:', e);
      setSubjects([]);
    }
  };

  useEffect(() => {
    loadSchoolYears();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (selectedYear) {
      loadSections();
      fetchResources();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      fetchResources();
    }
  }, [selectedSection, selectedSubject, selectedType]);

  const handleOpenUploadForm = () => {
    navigate("/resources/upload");
  };

  const handleDownload = async (item: PedagogicalResource) => {
    try {
      await resourceService.download(item.id, item.file_name);
    } catch (e) {
      console.error(e);
      openModal({ title: "Erreur", description: "Impossible de télécharger le fichier.", variant: "error" });
    }
  };

  const handleDelete = (item: PedagogicalResource) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer la ressource "${item.title}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await resourceService.delete(item.id);
          openModal({ title: "Succès", description: "Ressource supprimée.", variant: "success" });
          await fetchResources();
        } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Impossible de supprimer.", variant: "error" });
        }
      },
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      course: "Cours",
      assignment: "Devoir",
      exam: "Examen",
      other: "Autre"
    };
    return types[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      course: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      assignment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    };
    return colors[type] || colors.other;
  };

  return (
    <>
      <PageMeta title="Ressources Pédagogiques" description="Gestion des ressources pédagogiques" />
      <PageBreadcrumb pageTitle="Ressources Pédagogiques" />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:items-end">
            <div className="w-full sm:w-64">
              <SchoolYearFilter
                value={selectedYear}
                onChange={setSelectedYear}
                years={schoolYears}
                loading={loading}
                showAll={false}
              />
            </div>
            
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe
              </label>
              <select
                value={selectedSection?.id || ""}
                onChange={(e) => {
                  const section = sections.find(s => s.id === Number(e.target.value));
                  setSelectedSection(section || null);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Toutes les classes</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name || section.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Matière
              </label>
              <select
                value={selectedSubject?.id || ""}
                onChange={(e) => {
                  const subject = subjects.find(s => s.id === Number(e.target.value));
                  setSelectedSubject(subject || null);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Toutes les matières</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Tous les types</option>
                <option value="course">Cours</option>
                <option value="assignment">Devoir</option>
                <option value="exam">Examen</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          {(userRole === 'admin' || userRole === 'directeur' || userRole === 'enseignant') && (
            <div className="flex justify-end">
              <Button onClick={handleOpenUploadForm} className="relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Ajouter une ressource
                </span>
                <span className="absolute inset-0 bg-warning-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
              </Button>
            </div>
          )}
        </div>

        <DataTable
          columns={[
            { key: "title", label: "Titre" },
            {
              key: "type",
              label: "Type",
              render: (val: string) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(val)}`}>
                  {getTypeLabel(val)}
                </span>
              ),
            },
            {
              key: "subject",
              label: "Matière",
              render: (val: any) => val?.name || "Toutes",
            },
            {
              key: "section",
              label: "Classe",
              render: (val: any) => val?.name || val?.code || "Toutes",
            },
            {
              key: "teacher",
              label: "Enseignant",
              render: (val: any) => val?.user?.name || "-",
            },
            {
              key: "file_name",
              label: "Fichier",
              render: (val: string, item: PedagogicalResource) => (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[150px] block">
                    {val}
                  </span>
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-900/20 transition-all duration-200"
                    title="Télécharger"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ),
            },
          ]}
          data={resources}
          loading={loading}
          onDelete={(userRole === 'admin' || userRole === 'directeur' || userRole === 'enseignant') ? handleDelete : undefined}
        />
      </div>
    </>
  );
}
