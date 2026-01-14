import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { useCustomModal } from "../../context/ModalContext";
import resourceService from "../../api/services/resourceService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import classroomService from "../../api/services/classroomService";
import subjectService from "../../api/services/subjectService";
import schoolYearService from "../../api/services/schoolYearService";
import useAuth from "../../providers/auth/useAuth";

export default function ResourceUploadPage() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { userInfo } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "course",
    section_id: "",
    subject_id: "",
    school_year_id: "",
    file: null as File | null,
  });

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
        
        if (!formData.school_year_id && uniqueItems.length > 0) {
          const active = uniqueItems.find((y: any) => y.is_active);
          const defaultYearId = active ? active.id : uniqueItems[0].id;
          setFormData(prev => ({ ...prev, school_year_id: defaultYearId.toString() }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSections = async () => {
    // Si pas d'année sélectionnée, on ne charge pas les sections ou on attend
    if (!formData.school_year_id) return;

    try {
      const res = await classroomService.list({ school_year_id: formData.school_year_id });
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

  // Recharger les sections quand l'année change
  useEffect(() => {
    if (formData.school_year_id) {
        loadSections();
    }
  }, [formData.school_year_id]);

  // Si activeSchoolYear change et qu'on n'a rien sélectionné, on met à jour (optionnel, pour confort)
  useEffect(() => {
      if (activeSchoolYear && !formData.school_year_id) {
          setFormData(prev => ({ ...prev, school_year_id: activeSchoolYear.id.toString() }));
      }
  }, [activeSchoolYear]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      openModal({ title: "Erreur", description: "Veuillez sélectionner un fichier.", variant: "error" });
      return;
    }

    if (!formData.school_year_id) {
        openModal({ title: "Erreur", description: "Veuillez sélectionner une année scolaire.", variant: "error" });
        return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("file", formData.file);
      data.append("school_year_id", formData.school_year_id.toString());
      
      if (formData.section_id) {
        data.append("section_id", formData.section_id);
      }
      if (formData.subject_id) {
        data.append("subject_id", formData.subject_id);
      }

      const res = await resourceService.upload(data);
      
      if (res && res.success) {
        openModal({
          title: "Succès",
          description: "Ressource ajoutée avec succès.",
          variant: "success",
          primaryLabel: "Voir la liste",
          primaryAction: () => navigate("/resources"),
        });
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e?.response?.data?.message || "Une erreur est survenue.";
      openModal({ title: "Erreur", description: errorMsg, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ajouter une ressource" description="Téléverser une nouvelle ressource pédagogique" />
      <PageBreadcrumb pageTitle="Ajouter une ressource" />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* School Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Année scolaire <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.school_year_id}
                onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value, section_id: "" })} // Reset section on year change
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Sélectionner une année</option>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name || year.label || `${year.year_start}-${year.year_end}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Ex: Cours de mathématiques - Chapitre 1"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Description de la ressource..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="course">Cours</option>
                <option value="assignment">Devoir</option>
                <option value="exam">Examen</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe (optionnel)
                {!formData.school_year_id && <span className="text-xs text-gray-500 ml-2">(Sélectionnez une année d'abord)</span>}
              </label>
              <select
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                disabled={!formData.school_year_id}
              >
                <option value="">Toutes les classes</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name || section.code}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Laissez vide pour rendre la ressource accessible à toutes les classes
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Matière (optionnel)
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
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

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fichier <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg hover:border-brand-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none"
                    >
                      <span>Téléverser un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        required
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, PPT, XLS, images jusqu'à 20MB
                  </p>
                  {formData.file && (
                    <p className="text-sm text-brand-600 dark:text-brand-400 mt-2">
                      Fichier sélectionné: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/resources")}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Téléversement..." : "Ajouter la ressource"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
