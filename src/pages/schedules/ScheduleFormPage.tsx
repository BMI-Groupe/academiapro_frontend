import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import scheduleService from "../../api/services/scheduleService";
import classroomService from "../../api/services/classroomService";
import teacherService from "../../api/services/teacherService";
import subjectService from "../../api/services/subjectService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

const DAYS = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
];

export default function ScheduleFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [form, setForm] = useState({
    classroom_id: "",
    subject_id: "",
    teacher_id: "",
    school_year_id: "",
    day_of_week: "monday",
    start_time: "08:00",
    end_time: "09:00",
    room: "",
  });

  const scheduleId = searchParams.get("id");
  const isEdit = !!scheduleId;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !form.school_year_id) {
      setForm(prev => ({ ...prev, school_year_id: activeSchoolYear.id.toString() }));
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (scheduleId) {
      loadSchedule();
    }
  }, [scheduleId]);

  // Charger les classes et matières quand l'année scolaire change
  useEffect(() => {
    if (form.school_year_id) {
      loadClassrooms(form.school_year_id);
      loadSubjects(form.school_year_id);
    } else {
      setClassrooms([]);
      setSubjects([]);
    }
  }, [form.school_year_id]);

  // Charger les matières de la classe quand la classe change
  useEffect(() => {
    if (form.school_year_id && form.classroom_id) {
      loadSubjectsForClassroom(form.school_year_id, form.classroom_id);
    } else if (form.school_year_id && !form.classroom_id) {
      // Si pas de classe sélectionnée, charger toutes les matières de l'année
      loadSubjects(form.school_year_id);
    }
  }, [form.classroom_id, form.school_year_id]);

  const loadData = async () => {
    try {
      const [teacherRes, yearRes] = await Promise.all([
        teacherService.list(),
        schoolYearService.list(),
      ]);

      const extractItems = (res: any) => {
        if (!res?.success) return [];
        
        if (Array.isArray(res.data)) {
          const firstItem = res.data[0];
          
          // Case 1: Wrapped array [ [...] ] (e.g., school years)
          if (Array.isArray(firstItem)) {
            return firstItem;
          }
          
          // Case 2: Wrapped paginator [ { data: [...] } ]
          if (firstItem && typeof firstItem === 'object' && Array.isArray(firstItem.data)) {
            return firstItem.data;
          }
          
          // Case 3: Direct array
          return res.data;
        }
        
        // Case 4: Direct paginator { data: [...] }
        if (res.data && Array.isArray(res.data.data)) {
          return res.data.data;
        }
        
        return [];
      };

      setTeachers(extractItems(teacherRes));
      setSchoolYears(extractItems(yearRes));

      // Charger les classes et matières si une année scolaire est déjà sélectionnée
      if (form.school_year_id) {
        await Promise.all([
          loadClassrooms(form.school_year_id),
          loadSubjects(form.school_year_id),
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClassrooms = async (schoolYearId: string) => {
    try {
      const res = await classroomService.list({ school_year_id: parseInt(schoolYearId) });
      
      if (res?.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        setClassrooms(items || []);
      }
    } catch (e) {
      console.error(e);
      setClassrooms([]);
    }
  };

  const loadSubjects = async (schoolYearId: string) => {
    try {
      const res = await subjectService.list({ school_year_id: parseInt(schoolYearId), per_page: 1000 });
      console.log('loadSubjects response:', res);
      
      if (res?.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        console.log('Subjects extracted:', items);
        setSubjects(items || []);
      } else {
        console.warn('loadSubjects: res.success is false', res);
        setSubjects([]);
      }
    } catch (e) {
      console.error('Error loading subjects:', e);
      setSubjects([]);
    }
  };

  const loadSubjectsForClassroom = async (schoolYearId: string, classroomId: string) => {
    try {
      // Charger les matières de la classe spécifique
      const res = await classroomService.getSubjects(parseInt(classroomId), parseInt(schoolYearId));
      console.log('loadSubjectsForClassroom response:', res);
      
      if (res?.success) {
        let sectionSubjects: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0])) {
            sectionSubjects = res.data[0];
          } else if (res.data[0] && res.data[0].data && Array.isArray(res.data[0].data)) {
            sectionSubjects = res.data[0].data;
          } else {
            sectionSubjects = res.data;
          }
        } else if (res.data && Array.isArray(res.data)) {
          sectionSubjects = res.data;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          sectionSubjects = res.data.data;
        }
        
        console.log('SectionSubjects extracted:', sectionSubjects);
        
        // Extraire les objets Subject depuis les SectionSubject
        const subjects = sectionSubjects
          .filter((ss: any) => ss && ss.subject) // Filtrer ceux qui ont un subject
          .map((ss: any) => ({
            ...ss.subject,
            coefficient: ss.coefficient, // Garder le coefficient si nécessaire
          })); // Extraire le subject avec ses propriétés
        
        console.log('Subjects extracted from classroom:', subjects);
        setSubjects(subjects || []);
      } else {
        console.warn('loadSubjectsForClassroom: res.success is false', res);
        // En cas d'erreur, charger toutes les matières de l'année
        loadSubjects(schoolYearId);
      }
    } catch (e) {
      console.error('Error loading subjects for classroom:', e);
      // En cas d'erreur, charger toutes les matières de l'année
      loadSubjects(schoolYearId);
    }
  };

  const loadSchedule = async () => {
    try {
      const res = await scheduleService.get(parseInt(scheduleId!));
      if (res?.success) {
        const schedule = Array.isArray(res.data) ? res.data[0] : res.data;
        const scheduleData = {
          classroom_id: schedule.classroom_id?.toString() || schedule.section_id?.toString() || "",
          subject_id: schedule.subject_id?.toString() || "",
          teacher_id: schedule.teacher_id?.toString() || "",
          school_year_id: schedule.school_year_id?.toString() || "",
          day_of_week: schedule.day_of_week || "monday",
          start_time: schedule.start_time || "08:00",
          end_time: schedule.end_time || "09:00",
          room: schedule.room || "",
        };
        setForm(scheduleData);
        
        // Charger les classes et matières pour l'année scolaire du schedule
        if (scheduleData.school_year_id) {
          await Promise.all([
            loadClassrooms(scheduleData.school_year_id),
            scheduleData.classroom_id 
              ? loadSubjectsForClassroom(scheduleData.school_year_id, scheduleData.classroom_id)
              : loadSubjects(scheduleData.school_year_id),
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.classroom_id || !form.subject_id || !form.teacher_id || !form.school_year_id) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        classroom_id: parseInt(form.classroom_id),
        subject_id: parseInt(form.subject_id),
        teacher_id: parseInt(form.teacher_id),
        school_year_id: parseInt(form.school_year_id),
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room,
      };

      if (isEdit) {
        await scheduleService.update(parseInt(scheduleId!), payload);
        openModal({
          title: "Succès",
          description: "Emploi du temps mis à jour avec succès.",
          variant: "success",
        });
      } else {
        await scheduleService.create(payload);
        openModal({
          title: "Succès",
          description: "Emploi du temps créé avec succès.",
          variant: "success",
        });
      }

      navigate("/schedules");
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title={isEdit ? "Modifier l'emploi du temps" : "Ajouter un emploi du temps"} description="Formulaire d'emploi du temps" />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier l'emploi du temps" : "Ajouter un emploi du temps"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Année scolaire *</Label>
              <select
                value={form.school_year_id}
                onChange={(e) => {
                  setForm({ 
                    ...form, 
                    school_year_id: e.target.value,
                    classroom_id: "", // Réinitialiser la classe
                    subject_id: "", // Réinitialiser la matière
                  });
                }}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner une année scolaire</option>
                {schoolYears.map((year, index) => (
                  <option key={`${year.id}-${index}`} value={year.id}>
                    {year.label} {year.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Classe *</Label>
              <select
                value={form.classroom_id}
                onChange={(e) => {
                  setForm({ 
                    ...form, 
                    classroom_id: e.target.value,
                    subject_id: "", // Réinitialiser la matière quand la classe change
                  });
                }}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
                disabled={!form.school_year_id}
              >
                <option value="">
                  {!form.school_year_id ? "Sélectionnez d'abord une année scolaire" : "Sélectionner une classe"}
                </option>
                {classrooms.map((classroom, index) => (
                  <option key={`${classroom.id}-${index}`} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Matière *</Label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
                disabled={!form.school_year_id || (!form.classroom_id && subjects.length === 0)}
              >
                <option value="">
                  {!form.school_year_id 
                    ? "Sélectionnez d'abord une année scolaire" 
                    : form.classroom_id && subjects.length === 0
                    ? "Aucune matière assignée à cette classe" 
                    : !form.classroom_id && subjects.length === 0
                    ? "Sélectionnez d'abord une classe pour voir ses matières"
                    : "Sélectionner une matière"}
                </option>
                {subjects.map((subject, index) => (
                  <option key={`${subject.id}-${index}`} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ''}
                  </option>
                ))}
              </select>
              {form.school_year_id && form.classroom_id && subjects.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Cette classe n'a pas encore de matières assignées pour cette année scolaire.
                </p>
              )}
            </div>

            <div>
              <Label>Enseignant *</Label>
              <select
                value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map((teacher, index) => (
                  <option key={`${teacher.id}-${index}`} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Jour *</Label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Salle</Label>
              <Input
                type="text"
                placeholder="Salle 101"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </div>

            <div>
              <Label>Heure de début *</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>

            <div>
              <Label>Heure de fin *</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate("/schedules")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
