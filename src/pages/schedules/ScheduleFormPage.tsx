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

  const loadData = async () => {
    try {
      const [classRes, teacherRes, subjectRes, yearRes] = await Promise.all([
        classroomService.list(),
        teacherService.list(),
        subjectService.list(),
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

      setClassrooms(extractItems(classRes));
      setTeachers(extractItems(teacherRes));
      setSubjects(extractItems(subjectRes));
      setSchoolYears(extractItems(yearRes));
    } catch (e) {
      console.error(e);
    }
  };

  const loadSchedule = async () => {
    try {
      const res = await scheduleService.get(parseInt(scheduleId!));
      if (res?.success) {
        const schedule = res.data;
        setForm({
          classroom_id: schedule.classroom_id?.toString() || "",
          subject_id: schedule.subject_id?.toString() || "",
          teacher_id: schedule.teacher_id?.toString() || "",
          school_year_id: schedule.school_year_id?.toString() || "",
          day_of_week: schedule.day_of_week || "monday",
          start_time: schedule.start_time || "08:00",
          end_time: schedule.end_time || "09:00",
          room: schedule.room || "",
        });
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
                onChange={(e) => setForm({ ...form, school_year_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner une année scolaire</option>
                {schoolYears.map((year, index) => (
                  <option key={`${year.id}-${index}`} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Classe *</Label>
              <select
                value={form.classroom_id}
                onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner une classe</option>
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
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((subject, index) => (
                  <option key={`${subject.id}-${index}`} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
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
