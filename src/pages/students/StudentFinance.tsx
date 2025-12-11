import React, { useEffect, useState } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import paymentService, { Balance, Payment } from "../../api/services/paymentService";

interface StudentFinanceProps {
  studentId: number;
  schoolYearId: number;
}

export default function StudentFinance({ studentId, schoolYearId }: StudentFinanceProps) {
  const { openModal } = useCustomModal();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFinanceData();
  }, [studentId, schoolYearId]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [balanceRes, paymentsRes] = await Promise.all([
        paymentService.getStudentBalance(studentId, schoolYearId),
        paymentService.getStudentPayments(studentId, schoolYearId),
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.data);
      }
      if (paymentsRes.success) {
        setPayments(paymentsRes.data);
      }
    } catch (e) {
      console.error(e);
      // Silent error or toast
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      openModal({
        title: "Validation",
        description: "Veuillez saisir un montant valide.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
        const payload = {
        student_id: studentId,
        school_year_id: schoolYearId,
        amount: parseFloat(amount),
        type: "TUITION",
        payment_date: new Date().toISOString().split("T")[0], // Today
        notes: notes,
      };

      const res = await paymentService.recordPayment(payload);

      if (res.success) {
        openModal({
          title: "Succès",
          description: "Paiement enregistré avec succès.",
          variant: "success",
        });
        setAmount("");
        setNotes("");
        setShowPaymentForm(false);
        loadFinanceData(); // Refresh data
        
        // Auto download receipt?
        // handleDownloadReceipt(res.data.id);
      } else {
        openModal({
          title: "Erreur",
          description: res.error || "Une erreur est survenue.",
          variant: "error",
        });
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    const res = await paymentService.downloadReceipt(paymentId);
    if (!res.success) {
      openModal({
        title: "Information",
        description: "La génération de reçu n'est pas encore disponible.",
        variant: "info",
      });
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Chargement des données financières...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance Summary Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
            Situation Financière - {balance?.classroom}
          </h3>
          <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
            {showPaymentForm ? "Annuler" : "Nouveau Paiement"}
          </Button>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Enregistrer un paiement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Notes (optionnel)</Label>
                <Input
                  placeholder="Ex: Payé par chèque..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleRecordPayment} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Valider le paiement"}
              </Button>
            </div>
          </div>
        )}

        {/* Balance Stats */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total à payer</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {new Intl.NumberFormat("fr-FR").format(balance.total_due)} FCFA
              </div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Déjà payé</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {new Intl.NumberFormat("fr-FR").format(balance.total_paid)} FCFA
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${balance.balance > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800'}`}>
              <div className={`text-sm mb-1 ${balance.balance > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Reste à payer
              </div>
              <div className={`text-2xl font-bold ${balance.balance > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {new Intl.NumberFormat("fr-FR").format(balance.balance)} FCFA
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-4">
          Historique des paiements
        </h3>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun paiement enregistré pour cette année.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Référence</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Montant</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-900 dark:text-white/90 font-mono">
                      {payment.reference}
                    </td>
                    <td className="p-3 text-sm text-gray-900 dark:text-white/90">
                      {payment.type === "TUITION" ? "Écolage" : payment.type}
                    </td>
                    <td className="p-3 text-right text-sm font-bold text-gray-900 dark:text-white/90">
                      {new Intl.NumberFormat("fr-FR").format(payment.amount)} FCFA
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(payment.id)}>
                        Reçu
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
