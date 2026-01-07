import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import classroomService from "../../api/services/classroomService";
import studentService from "../../api/services/studentService";
import paymentService from "../../api/services/paymentService";
import schoolYearService from "../../api/services/schoolYearService";
import SearchableSelect from "../../components/form/SearchableSelect";


export default function PaymentFormPage() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  
  // Data sources
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // Form State
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentType, setPaymentType] = useState<string>("TUITION");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  
  // Loading states
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tuitionFeeRef, setTuitionFeeRef] = useState<number | null>(null);

  // Initial load: Fetch school years
  useEffect(() => {
    loadSchoolYears();
  }, []);

  // Set default school year when activeSchoolYear is loaded or years list changes


  // Load classrooms when selected school year changes
  useEffect(() => {
    if (selectedSchoolYearId) {
        loadClassrooms(selectedSchoolYearId);
    } else {
        setClassrooms([]);
    }
    // Reset classroom and student selection when year changes
    setSelectedClassroom("");
    setSelectedStudent("");
    setStudents([]);
    setTuitionFeeRef(null);
  }, [selectedSchoolYearId]);

  const loadSchoolYears = async () => {
      try {
          const res = await schoolYearService.list({ per_page: 100 });
          if (res.data) {
              let list: any[] = [];
              if (Array.isArray(res.data)) {
                   if (res.data.length > 0 && res.data[0].data && Array.isArray(res.data[0].data)) {
                       list = res.data[0].data;
                   } else {
                       list = res.data;
                   }
              } else if (res.data.data && Array.isArray(res.data.data)) {
                   list = res.data.data;
              }

              setSchoolYears(list);
              
              if (!selectedSchoolYearId) {
                  const activeYear = list.find((y: any) => y.is_active || y.is_active === 1 || y.is_active === "1");
                  if (activeYear) {
                      setSelectedSchoolYearId(activeYear.id.toString());
                  }
              }
          }
      } catch (e) {
          console.error("Error loading school years", e);
      }
  };

  const loadClassrooms = async (yearId: string) => {
    setLoadingConfig(true);
    try {
      const res = await classroomService.list({ per_page: 100, school_year_id: yearId });
      if (res && res.data) {
          let list: any[] = [];
          if (Array.isArray(res.data)) {
               if (res.data.length > 0 && res.data[0].data && Array.isArray(res.data[0].data)) {
                   list = res.data[0].data;
               } else {
                   list = res.data;
               }
          } else if (res.data.data && Array.isArray(res.data.data)) {
               list = res.data.data;
          }
          setClassrooms(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleClassroomChange = async (classroomId: string) => {
      setSelectedClassroom(classroomId);
      setSelectedStudent("");
      setStudents([]);
      setTuitionFeeRef(null);

      if (!classroomId) return;

      const cls = classrooms.find(c => c.id.toString() === classroomId);
      if (cls && cls.tuition_fee) {
          setTuitionFeeRef(parseFloat(cls.tuition_fee));
      }

      setLoadingStudents(true);
      try {
          const res = await studentService.list({ 
              section_id: classroomId, // Utiliser section_id au lieu de classroom_id
              school_year_id: selectedSchoolYearId,
              per_page: 100 
          });
          
          if (res.data) {
             let list: any[] = [];
             if (Array.isArray(res.data)) {
                  if (res.data.length > 0 && res.data[0].data && Array.isArray(res.data[0].data)) {
                      list = res.data[0].data;
                  } else {
                      list = res.data;
                  }
             } else if (res.data.data && Array.isArray(res.data.data)) {
                  list = res.data.data;
             }
             setStudents(list);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingStudents(false);
      }
  };

  const handleSubmit = async () => {
      if (!selectedStudent || !amount || parseFloat(amount) <= 0 || !selectedSchoolYearId || !paymentType) {
           openModal({
              title: "Validation",
              description: "Veuillez remplir tous les champs obligatoires (Année, Classe, Élève, Type, Montant).",
              variant: "error"
           });
           return;
      }

      setSubmitting(true);
      try {
          const payload = {
              student_id: parseInt(selectedStudent),
              amount: parseFloat(amount),
              payment_date: new Date().toISOString().split('T')[0],
              type: paymentType,
              school_year_id: parseInt(selectedSchoolYearId),
              notes: notes
          };

          const res = await paymentService.recordPayment(payload);
          if (res.success) {
              openModal({
                  title: "Succès",
                  description: "Paiement enregistré avec succès.",
                  variant: "success",
                  primaryLabel: "Voir le reçu",
                  primaryAction: async () => {
                      navigate(`/payments/${res.data.id}/receipt`);
                  }
              });
          } else {
              openModal({
                title: "Erreur",
                description: res.error || "Erreur inconnue.",
                variant: "error"
             });
          }
      } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Une erreur est survenue.",
            variant: "error"
         });
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <>
      <PageMeta title="Enregistrer Paiement" description="Nouveau paiement d'écolage" />
      <PageBreadcrumb pageTitle="Nouveau Paiement" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Détails du paiement
        </h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* School Year Select */}
            <div className="space-y-1">
                <Label>Année Scolaire</Label>
                <select 
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                    value={selectedSchoolYearId}
                    onChange={(e) => setSelectedSchoolYearId(e.target.value)}
                    disabled={submitting}
                >
                    <option value="">Sélectionner une année</option>
                    {schoolYears.map((y, index) => (
                        <option key={`${y.id}-${index}`} value={y.id}>
                            {y.label} {y.is_active ? '(Active)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Classroom Select */}
            <div className="space-y-1">
                <Label>Classe</Label>
                <select 
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                    value={selectedClassroom}
                    onChange={(e) => handleClassroomChange(e.target.value)}
                    disabled={loadingConfig || submitting || !selectedSchoolYearId}
                >
                    <option value="">
                        {!selectedSchoolYearId ? "Sélectionnez d'abord une année" : "Sélectionner une classe"}
                    </option>
                    {classrooms.map((c, index) => (
                        <option key={`${c.id}-${index}`} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {tuitionFeeRef && (
                    <p className="mt-1 text-sm text-gray-500">
                        Écolage prévu: <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('fr-FR').format(tuitionFeeRef)} FCFA</span>
                    </p>
                )}
            </div>

            {/* Student Select */}
            <div className="space-y-1">
                <Label>Élève</Label>
                <SearchableSelect
                    options={students.map((student) => ({
                        value: student.id.toString(),
                        label: `${student.first_name} ${student.last_name} (${student.matricule})`,
                    }))}
                    value={selectedStudent}
                    onChange={(value) => setSelectedStudent(value)}
                    placeholder={
                        !selectedSchoolYearId 
                            ? "Sélectionnez d'abord une année scolaire" 
                            : !selectedClassroom 
                                ? "Sélectionnez d'abord une classe"
                                : loadingStudents
                                    ? "Chargement..."
                                    : students.length === 0
                                        ? "Aucun élève disponible"
                                        : "Sélectionner un élève"
                    }
                    searchPlaceholder="Rechercher un élève..."
                    disabled={!selectedClassroom || loadingStudents || submitting}
                    required
                />
                {!selectedSchoolYearId && (
                    <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
                )}
                {selectedSchoolYearId && !selectedClassroom && (
                    <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une classe</p>
                )}
                {selectedSchoolYearId && selectedClassroom && students.length === 0 && !loadingStudents && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                        Aucun élève inscrit dans cette classe pour cette année scolaire.
                    </p>
                )}
            </div>

            {/* Payment Type Select */}
            <div className="space-y-1">
                <Label>Type de Paiement</Label>
                <select 
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    disabled={submitting}
                >
                    <option value="TUITION">Écolage</option>
                    <option value="REGISTRATION">Inscription</option>
                    <option value="OTHER">Autre</option>
                </select>
            </div>

            {/* Amount */}
            <div className="space-y-1">
                <Label>Montant (FCFA)</Label>
                <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Ex: 50000"
                    disabled={submitting}
                />
            </div>

            {/* Notes */}
            <div className="space-y-1">
                <Label>Notes / Référence (Optionnel)</Label>
                <Input 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Chèque N°..., Virement..."
                    disabled={submitting}
                />
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
          <Button variant="outline" onClick={() => navigate("/payments")} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enregistrement..." : "Enregistrer le paiement"}
          </Button>
        </div>
      </div>
    </>
  );
}
