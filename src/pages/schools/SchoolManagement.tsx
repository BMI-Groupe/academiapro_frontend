import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { PlusIcon, TrashBinIcon, PencilIcon } from "../../icons";
import { useCustomModal } from "../../context/ModalContext";
import schoolService, { School } from "../../api/services/schoolService";
import { STORAGE_URL } from "../../api/axios";

export default function SchoolManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await schoolService.list();
      if (res.success) {
        setSchools(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    openModal({
        title: "Confirmer la suppression",
        description: "Êtes-vous sûr de vouloir supprimer cette école ? Cette action est irréversible.",
        variant: "error",
        primaryLabel: "Supprimer",
        primaryAction: async () => {
            try {
                await schoolService.delete(id);
                fetchSchools();
            } catch (e) {
                console.error(e);
            }
        }
    });
  };

  return (
    <>
      <PageMeta title="Gestion des Écoles" description="Liste des écoles de la plateforme" />
      <PageBreadcrumb pageTitle="Écoles" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Liste des Écoles</h2>
           <Button onClick={() => navigate("/schools/new")} startIcon={<PlusIcon />}>
              Ajouter une école
           </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
           {loading ? (
             <div className="text-center py-8 text-gray-500">Chargement...</div>
           ) : schools.length === 0 ? (
             <div className="text-center py-8 text-gray-500">Aucune école enregistrée.</div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                 <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3">Logo</th>
                     <th className="px-6 py-3">Nom</th>
                     <th className="px-6 py-3">Ville / Adresse</th>
                     <th className="px-6 py-3">Contact</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {schools.map((school) => (
                     <tr key={school.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                       <td className="px-6 py-4">
                         {school.logo ? (
                           <img 
                              src={`${STORAGE_URL}/${school.logo}`} 
                              alt={school.name} 
                              className="h-10 w-10 rounded-full object-cover"
                           />
                         ) : (
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700">
                             {school.name.substring(0,2).toUpperCase()}
                           </div>
                         )}
                       </td>
                       <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                         {school.name}
                       </td>
                       <td className="px-6 py-4">
                          {school.address || "-"}
                       </td>
                       <td className="px-6 py-4">
                         {school.phone && <div>{school.phone}</div>}
                         {school.email && <div className="text-xs">{school.email}</div>}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={() => navigate(`/schools/${school.id}/edit`)} className="text-gray-500 hover:text-brand-600">
                             <PencilIcon className="h-5 w-5" />
                           </button>
                           <button onClick={() => handleDelete(school.id)} className="text-gray-500 hover:text-red-600">
                             <TrashBinIcon className="h-5 w-5" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>
    </>
  );
}
