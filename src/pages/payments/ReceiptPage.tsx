import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import paymentService from '../../api/services/paymentService';
import Button from '../../components/ui/button/Button';
import useAuth from '../../providers/auth/useAuth';

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore
  const { userInfo } = useAuth();
  // @ts-ignore
  const school = userInfo?.school;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
       // On utilise directement l'endpoint que je viens de créer
       fetchReceipt();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      // paymentService doit avoir une méthode get(id) qui appelle /payments/:id
      // Si elle n'existe pas, on simule l'appel direct fetch ici, mais l'idéal est de passer par le service
      // Pour l'instant j'utilise une fonction locale ad-hoc si nécessaire, ou je suppose que je vais update le service.
      const res = await paymentService.get(parseInt(id!)); 
      if (res && res.success) {
          setPayment(res.data);
      } else {
          setError('Impossible de récupérer le reçu.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Chargement du reçu...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!payment) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white flex flex-col items-center">
      
      {/* Boutons d'action (masqués à l'impression) */}
      <div className="mb-6 print:hidden w-full max-w-3xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Aperçu du reçu</h1>
        <Button onClick={handlePrint}>Imprimer / PDF</Button>
      </div>

      {/* Zone du reçu (A4 simulé) */}
      <div className="bg-white w-full max-w-3xl p-8 rounded shadow-lg print:shadow-none print:w-full print:max-w-none">
        
        {/* En-tête avec Logo École */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6 flex flex-row justify-between items-start gap-4">
          <div className="flex gap-4 items-start">
             {school?.logo_url ? (
                 <img src={school.logo_url} alt="Logo" className="object-contain h-24 w-auto" />
             ) : (
                 <div className="h-24 w-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Logo</div>
             )}
             <div>
                <h3 className="text-xl font-bold text-blue-900 uppercase">{school?.name || "NOM DE L'ÉCOLE"}</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">{school?.address || "Adresse de l'école"}</p>
                <p className="text-sm text-gray-500">Tél : {school?.phone || "+000 00 00 00 00"}</p>
                <p className="text-sm text-gray-500">Email : {school?.email || "contact@ecole.com"}</p>
             </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase tracking-wide text-gray-900">REÇU DE PAIEMENT</h2>
            <p className="text-sm text-gray-600 mt-2 font-mono">N° : {String(payment.reference || payment.id).toUpperCase()}</p>
            <p className="text-sm text-gray-600">Date : {new Date(payment.payment_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Info Payeur / Élève */}
        <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Reçu de (Élève) :</p>
              <p className="text-lg font-bold text-gray-800">
                {payment.student?.first_name} {payment.student?.last_name}
              </p>
              <p className="text-sm text-gray-600">Matricule : {payment.student?.matricule}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Année Scolaire :</p>
              <p className="text-lg font-medium text-gray-800">{payment.school_year?.label || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Détail Paiement */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-sm font-semibold text-gray-600 uppercase">Description</th>
                <th className="py-2 text-sm font-semibold text-gray-600 uppercase">Moyen de paiement</th>
                <th className="py-2 text-sm font-semibold text-gray-600 uppercase text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-800">
                  {payment.type === 'tuition' ? 'Frais de scolarité' : 
                   payment.type === 'registration' ? 'Frais d\'inscription' : 
                   payment.type === 'canteen' ? 'Cantine' : 
                   payment.type === 'transport' ? 'Transport' : 'Autre'}
                   {payment.notes && <div className="text-xs text-gray-500 italic mt-1">{payment.notes}</div>}
                </td>
                <td className="py-4 text-gray-800 capitalize">{payment.payment_method || 'Espèces'}</td>
                <td className="py-4 text-gray-900 font-bold text-right text-xl">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(payment.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total et Signature */}
        <div className="flex justify-between items-end mt-12 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 italic w-1/2">
            <p>Ce reçu est une preuve de paiement valide.</p>
            <p>Merci de votre confiance.</p>
          </div>
          <div className="text-right w-1/3">
             <div className="mb-8">
                 <p className="text-xs font-bold uppercase text-gray-400 mb-2">Signature / Cachet</p>
                 <div className="h-16 border-b border-gray-300"></div>
             </div>
             <p className="text-sm text-gray-400">Enregistré par : {payment.user?.name || 'Système'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
