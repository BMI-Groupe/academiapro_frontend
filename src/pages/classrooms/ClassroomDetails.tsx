import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import classroomService from "../../api/services/classroomService";
import schoolYearService from "../../api/services/schoolYearService";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function ClassroomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchoolYears();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (id && selectedYear) {
      fetchClassroomDetails();
    }
  }, [id, selectedYear]);

  const loadSchoolYears = async () => {
    try {
      const res = await schoolYearService.list();
      if (res && res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
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

  const fetchClassroomDetails = async () => {
    if (!id || !selectedYear) return;

    setLoading(true);
    try {
      const res = await classroomService.get(parseInt(id!));
      if (res && res.success) {
        setClassroom(res.data);
        
        // Filter enrollments by selected year
        const yearEnrollments = res.data.enrollments?.filter(
          (e: any) => e.school_year_id === selectedYear.id
        ) || [];
        
        // Get students from enrollments
        const studentList = yearEnrollments.map((e: any) => ({
          ...e.student,
          enrollment: e,
        }));
        
        setStudents(studentList);
        
        // Calculate rankings (simplified - in real app, this would come from backend)
        const studentsWithAverages = studentList.map((student: any) => {
          // This would normally calculate from grades
          const average = student.report_cards?.[0]?.average || 0;
          return {
            ...student,
            average,
          };
        });
        
        const sorted = studentsWithAverages.sort((a, b) => b.average - a.average);
        const withRanks = sorted.map((s, index) => ({
          ...s,
          rank: index + 1,
        }));
        
        setRankings(withRanks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRankings = () => {
    if (!rankings || rankings.length === 0) return;

    // Create CSV content
    const headers = ["Rang", "Matricule", "Nom", "Prénom", "Moyenne"];
    const rows = rankings.map(s => [
      s.rank,
      s.matricule,
      s.last_name,
      s.first_name,
      s.average?.toFixed(2) || "0.00"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `classement-${classroom?.code}-${selectedYear?.label}.csv`;
    link.click();
  };

  if (loading && !classroom) {
    return (
      <>
        <PageMeta title="Détails de la classe" description="Chargement..." />
        <PageBreadcrumb pageTitle="Détails de la classe" />
        <div className="text-center py-8">Chargement...</div>
      </>
    );
  }

  if (!classroom) {
    return (
      <>
        <PageMeta title="Classe introuvable" description="Classe introuvable" />
        <PageBreadcrumb pageTitle="Classe introuvable" />
        <div className="text-center py-8">Classe introuvable</div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={classroom.name} description="Détails de la classe" />
      <PageBreadcrumb pageTitle="Détails de la classe" />

      <div className="space-y-6">
        {/* Classroom Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {classroom.name}
              </h2>
              <p className="text-gray-500 mt-1">Code: {classroom.code}</p>
            </div>
            <Button onClick={() => navigate(`/classrooms/${id}/edit`)}>
              Modifier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500">Cycle</p>
              <p className="font-medium text-gray-800 dark:text-white">{classroom.cycle || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="font-medium text-gray-800 dark:text-white">{classroom.level || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* School Year Filter */}
        <div className="flex justify-between items-center">
          <SchoolYearFilter
            value={selectedYear}
            onChange={setSelectedYear}
            years={schoolYears}
            loading={loading}
            className="w-64"
          />
          {rankings.length > 0 && (
            <Button onClick={handleDownloadRankings}>
              Télécharger le classement
            </Button>
          )}
        </div>

        {/* Students List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Liste des élèves - {selectedYear?.label}
          </h3>

          {students.length === 0 ? (
            <p className="text-gray-500">Aucun élève inscrit pour cette année.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Matricule</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prénom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date d'inscription</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-800 dark:text-white">{student.matricule}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.last_name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.first_name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {student.enrollment?.enrolled_at 
                          ? new Date(student.enrollment.enrolled_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          onClick={() => navigate(`/students/${student.id}/details`)}
                          className="text-sm"
                        >
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rankings */}
        {rankings.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Classement - {selectedYear?.label}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rang</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Matricule</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prénom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-800 dark:text-white font-bold">
                        {student.rank}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.matricule}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.last_name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.first_name}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-white font-medium">
                        {student.average?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
