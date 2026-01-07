import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useCustomModal } from "../../context/ModalContext";
import paymentService, { Payment } from "../../api/services/paymentService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import schoolYearService from "../../api/services/schoolYearService";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);

  // Charger les années scolaires
  useEffect(() => {
    const loadSchoolYears = async () => {
        try {
            // console.log("📅 Chargement des années scolaires...");
            const res = await schoolYearService.list();
            // console.log("📅 Réponse années scolaires:", res);
            if (res && res.success) {
                // Gestion robuste comme dans les autres composants
                let items: any[] = [];
                if (Array.isArray(res.data)) {
                   items = Array.isArray(res.data[0]) ? res.data[0] : res.data;
                } else if (res.data?.data) {
                   items = res.data.data;
                }
                const uniqueItems = items.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
                // console.log("📅 Années scolaires chargées:", uniqueItems);
                setSchoolYears(uniqueItems);
            }
        } catch(e) { console.error("❌ Erreur chargement années:", e); }
    };
    loadSchoolYears();
  }, []);

  // Initialiser selectedYear avec activeSchoolYear si présent
  useEffect(() => {
    // console.log("🎯 activeSchoolYear:", activeSchoolYear);
    // console.log("🎯 selectedYear actuel:", selectedYear);
    
    if (activeSchoolYear && !selectedYear) {
        // console.log("✅ Initialisation avec activeSchoolYear");
        setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  // Re-fetch quand selectedYear change
  useEffect(() => {
    // console.log("🔄 useEffect fetch - selectedYear:", selectedYear);
    // console.log("🔄 useEffect fetch - schoolYears.length:", schoolYears.length);
    
    if (selectedYear) {
        // console.log("✅ Appel fetchPayments avec selectedYear:", selectedYear);
        fetchPayments();
    } else if (schoolYears.length > 0 && !selectedYear) {
        // Fallback: si pas d'année sélectionnée, on prend la première
        // console.log("⚠️ Pas d'année sélectionnée, utilisation de la première année disponible");
        setSelectedYear(schoolYears[0]);
    } else {
        // console.log("⏳ En attente de selectedYear ou schoolYears");
    }
  }, [currentPage, selectedYear, searchTerm, schoolYears]);

  const fetchPayments = async () => {
    if (!selectedYear) return;
    
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        school_year_id: selectedYear.id, // Utiliser l'année sélectionnée
        search: searchTerm,
      };
      
      const res = await paymentService.getAll(filters);
      // console.log("Response complète:", res);
      // console.log("Données paginées:", res.data);
      
      if (res.success && res.data) {
        // res.data contient déjà l'objet paginé complet
        // res.data.data contient le tableau des paiements
        setPayments(res.data.data || []);
        setTotalPages(res.data.last_page || 1);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (paymentId: number) => {
      navigate(`/payments/${paymentId}/receipt`);
  };

  return (
    <>
      <PageMeta title="Gestion des Paiements" description="Liste des écolages payés" />
      <PageBreadcrumb pageTitle="Paiements / Écolages" />

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
                 loading={schoolYears.length === 0}
               />
             </div>
             <div className="relative w-full sm:w-72">
               <input
                  type="text"
                  placeholder="Rechercher (réf, nom, matricule)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
               />
             </div>
           </div>
           
           <Button onClick={() => navigate("/payments/new")} startIcon={<PlusIcon />}>
              Enregistrer un paiement
           </Button>
        </div>

        {/* Payments Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
           {loading ? (
             <div className="text-center py-8 text-gray-500">Chargement...</div>
           ) : payments.length === 0 ? (
             <div className="text-center py-8 text-gray-500">Aucun paiement trouvé pour cette sélection.</div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                 <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3">Date</th>
                     <th className="px-6 py-3">Référence</th>
                     <th className="px-6 py-3">Élève</th>
                     <th className="px-6 py-3">Classe</th>
                     <th className="px-6 py-3">Type de Paiement</th>
                     <th className="px-6 py-3 text-right">Montant</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payments.map((payment) => (
                     <tr key={payment.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                       <td className="px-6 py-4">
                         {new Date(payment.payment_date).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                         {payment.reference}
                       </td>
                       <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {payment.student?.first_name} {payment.student?.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{payment.student?.matricule}</div>
                       </td>
                       <td className="px-6 py-4">
                         {(() => {
                           // Trouver l'inscription pour l'année scolaire du paiement
                           const enrollment = payment.student?.enrollments?.find(
                             (e: any) => e.school_year_id === payment.school_year_id
                           );
                           return enrollment?.section?.name || 
                                  enrollment?.section?.classroom_template?.name || 
                                  enrollment?.classroom?.name || 
                                  "N/A";
                         })()}
                       </td>
                       <td className="px-6 py-4">
                         <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                           {payment.type === "TUITION" ? "Écolage" : payment.type || "N/A"}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                         {new Intl.NumberFormat("fr-FR").format(payment.amount)} FCFA
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                             onClick={() => handleDownloadReceipt(payment.id)} 
                             className="text-brand-600 hover:underline dark:text-brand-400"
                         >
                            Reçu
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="mt-4 flex justify-between">
                <Button 
                    variant="outline" 
                    disabled={currentPage <= 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                >
                    Précédent
                </Button>
                <span>Page {currentPage} / {totalPages}</span>
                <Button 
                    variant="outline" 
                    disabled={currentPage >= totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                >
                    Suivant
                </Button>
             </div>
           )}
        </div>
      </div>
    </>
  );
}
