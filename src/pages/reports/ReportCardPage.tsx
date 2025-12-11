import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

interface Subject {
  name: string;
  teacher: string;
  coefficient: number;
  studentAverage: number;
  classMin: number;
  classMax: number;
  classAverage: number;
  appreciation: string;
}

interface ReportCardData {
  id: number;
  student: {
    firstName: string;
    lastName: string;
    matricule?: string;
    photo?: string;
  };
  school: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
  schoolYear: string;
  period: string;
  classroom: string;
  section?: string;
  subjects: Subject[];
  generalAverage: number;
  rank: number;
  totalStudents: number;
  absences: number;
  mention: string;
  councilAppreciation: string;
}

export default function ReportCardPage() {
  const { id } = useParams();
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        fetchReportCard(parseInt(id));
    }
  }, [id]);

  const fetchReportCard = async (reportCardId: number) => {
      try {
          setLoading(true);
          // Import dynamic
          const service = (await import("../../api/services/reportCardService")).default;
          const res = await service.get(reportCardId);
          if (res.data && res.data.success) {
              setReportCard(res.data.data);
          } else {
              setReportCard(null);
          }
      } catch (error) {
          console.error("Failed to fetch report card", error);
          setReportCard(null);
      } finally {
          setLoading(false);
      }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAbsenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!reportCard) return;
    setReportCard({ ...reportCard, absences: parseInt(e.target.value) || 0 });
  };

  const saveAbsences = async () => {
    if (!reportCard) return;
    try {
        // @ts-ignore
        import('../../api/services/reportCardService').then(mod => {
             mod.default.update(reportCard.id, { absences: reportCard.absences });
        });
    } catch (e) {
        console.error("Error saving absences", e);
    }
  };

  // Direct import usage if possible, but imports are at top level usually. 
  // Let's use the object if it is in scope. It is not imported in the logic block?
  // Ah, I need to check imports. reportCardService should be imported.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement du bulletin...</div>
      </div>
    );
  }

  if (!reportCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Bulletin non trouvé</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta 
        title={`Bulletin - ${reportCard.student.firstName} ${reportCard.student.lastName}`}
        description={`Bulletin de notes du ${reportCard.period} - ${reportCard.schoolYear}`}
      />
      
      {/* Actions Bar */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-end print:hidden pt-6 px-4 sm:px-0">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg shadow hover:bg-brand-700 transition flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer le bulletin
        </button>
      </div>

      {/* Report Card */}
      <div id="printable-report" className="min-h-screen bg-gray-100 print:bg-white pb-8 print:py-0">
        <div className="max-w-5xl mx-auto bg-white shadow-xl print:shadow-none print:w-full">
          {/* Header */}
          <div className="border-b-2 border-gray-300 p-4 print:p-2 flex justify-between items-start">
            <div className="flex items-center gap-4">
               <img
                  src="/images/logo/main-logo.png"
                  alt="Logo"
                  className="max-h-20 print:max-h-16 w-auto object-contain"
               />
            </div>
            <div className="text-right text-sm print:text-xs">
              <div className="font-bold text-lg uppercase text-gray-800">{reportCard.school.name || "NOM DE L'ÉTABLISSEMENT"}</div>
              <div className="text-gray-600">{reportCard.school.address || "Adresse complète, Ville, Pays"}</div>
              <div className="text-gray-600">Tél: {reportCard.school.phone || "+00 000 000 000"}</div>
              {reportCard.school.website && <div className="text-blue-600">{reportCard.school.website}</div>}
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-4 print:py-2 bg-gray-50 border-b border-gray-200">
            <h1 className="text-2xl print:text-xl font-bold uppercase tracking-wide text-gray-900 leading-tight">
              BULLETIN DE NOTES
              <span className="block text-lg print:text-base font-medium text-gray-600 mt-1">{reportCard.period}</span>
            </h1>
            <p className="text-md print:text-sm mt-1 font-medium text-gray-500">Année scolaire: {reportCard.schoolYear}</p>
          </div>

          {/* Student Info */}
          <div className="p-4 print:p-2 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <div className="grid grid-cols-2 gap-x-12 print:gap-x-4 print:text-sm">
                     <div className="flex gap-4 border-b border-dotted border-gray-300 pb-1">
                        <span className="font-semibold text-gray-500 w-24">Matricule :</span>
                        <span className="font-mono font-bold text-gray-900">{reportCard.student.matricule || "N/A"}</span>
                     </div>
                     <div className="flex gap-4 border-b border-dotted border-gray-300 pb-1">
                        <span className="font-semibold text-gray-500 w-24">Classe :</span>
                        <span className="font-bold text-gray-900">{reportCard.classroom}</span>
                     </div>
                     <div className="flex gap-4 border-b border-dotted border-gray-300 pb-1 pt-2">
                        <span className="font-semibold text-gray-500 w-24">Nom :</span>
                        <span className="font-bold text-gray-900 uppercase">{reportCard.student.lastName}</span>
                     </div>
                     <div className="flex gap-4 border-b border-dotted border-gray-300 pb-1 pt-2">
                         <span className="font-semibold text-gray-500 w-24">Prénom :</span>
                         <span className="font-bold text-gray-900 capitalize">{reportCard.student.firstName}</span>
                     </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto p-4 print:p-2">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-slate-800 text-white print:bg-gray-200 print:text-black">
                  <th className="px-3 py-2 text-left font-semibold border border-slate-600 print:border-gray-400">Matières</th>
                  <th className="px-2 py-2 text-center font-semibold w-16 border border-slate-600 print:border-gray-400">Coef.</th>
                  <th className="px-2 py-2 text-center font-semibold w-24 border border-slate-600 print:border-gray-400">Moy /20</th>
                  <th className="px-2 py-2 text-center font-semibold border border-slate-600 print:border-gray-400" colSpan={3}>
                    Statistiques Classe
                  </th>
                  <th className="px-3 py-2 text-left font-semibold border border-slate-600 print:border-gray-400">Appréciations</th>
                </tr>
                <tr className="bg-slate-100 text-gray-700 text-xs uppercase tracking-wider font-semibold print:bg-white">
                  <th className="px-2 py-1 border border-gray-300"></th>
                  <th className="px-2 py-1 border border-gray-300"></th>
                  <th className="px-2 py-1 border border-gray-300">Note</th>
                  <th className="px-1 py-1 text-center border border-gray-300 w-14">Min</th>
                  <th className="px-1 py-1 text-center border border-gray-300 w-14">Max</th>
                  <th className="px-1 py-1 text-center border border-gray-300 w-14">Moy</th>
                  <th className="px-2 py-1 border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {reportCard.subjects.map((subject, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="font-bold text-gray-800">{subject.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">{subject.teacher}</div>
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300 font-semibold text-gray-700">
                      {subject.coefficient}
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-base border border-gray-300 text-slate-800">
                      {Number(subject.studentAverage).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300 text-xs text-gray-600">
                      {Number(subject.classMin).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300 text-xs text-gray-600">
                      {Number(subject.classMax).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-center border border-gray-300 text-xs font-medium text-slate-700">
                      {Number(subject.classAverage).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs border border-gray-300 italic text-gray-600">
                      {subject.appreciation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-6 py-2 text-xs text-gray-500 italic">
             * Note : Les moyennes sont calculées sur la base des coefficients.
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 border-t border-b border-gray-200 print:text-sm page-break-inside-avoid">
            <div className="p-3 bg-slate-700 text-white print:bg-gray-200 print:text-black print:border print:border-gray-400">
              <div className="font-semibold">Moyenne générale</div>
            </div>
            <div className="p-3 bg-slate-700 text-white print:bg-gray-200 print:text-black print:border print:border-gray-400">
              <div className="font-semibold">Nombre d'absence</div>
            </div>
            <div className="p-3 text-center text-xl font-bold bg-gray-50 print:bg-white print:border print:border-gray-400">
              {Number(reportCard.generalAverage).toFixed(2)}
            </div>
            <div className="p-3 text-center text-xl font-bold bg-gray-50 print:bg-white print:border print:border-gray-400 relative">
               <span className="print:block hidden">{reportCard.absences}</span>
               <div className="print:hidden">
                   <input
                       type="number"
                       min="0"
                       className="w-20 text-center bg-transparent border-b border-gray-400 focus:border-brand-500 focus:outline-none"
                       value={reportCard.absences}
                       onChange={handleAbsenceChange}
                       onBlur={async () => {
                           try {
                               const service = (await import("../../api/services/reportCardService")).default;
                               await service.update(reportCard.id, { absences: reportCard.absences });
                           } catch (e) { console.error(e); }
                       }}
                   />
               </div>
            </div>
          </div>

          {/* Mention and Appreciation */}
          <div className="grid grid-cols-2 border-b border-gray-200 print:text-sm page-break-inside-avoid">
            <div className="p-3 bg-slate-700 text-white print:bg-gray-200 print:text-black print:border print:border-gray-400">
              <div className="font-semibold">Mention</div>
            </div>
            <div className="p-3 bg-slate-700 text-white print:bg-gray-200 print:text-black print:border print:border-gray-400">
              <div className="font-semibold">Appréciations du conseil de classe</div>
            </div>
            <div className="p-3 text-center text-lg font-semibold bg-gray-50 print:bg-white print:border print:border-gray-400">
              {reportCard.mention}
            </div>
            <div className="p-3 text-sm bg-gray-50 print:bg-white print:border print:border-gray-400 italic">
              {reportCard.councilAppreciation}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 p-6 gap-8 print:p-4 page-break-inside-avoid">
            <div className="text-center">
              <div className="font-semibold mb-8 print:mb-16">Le Directeur</div>
              <div className="border-t border-gray-400 pt-1 text-xs text-gray-600">Signature</div>
            </div>
            <div className="text-center">
              <div className="font-semibold mb-8 print:mb-16">Le Professeur Principal</div>
              <div className="border-t border-gray-400 pt-1 text-xs text-gray-600">Signature</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: white;
            z-index: 9999;
          }
          /* Ensure backgrounds are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}
