import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import userService, { User } from "../../api/services/userService";
import { useCustomModal } from "../../context/ModalContext";
import useAuth from "../../providers/auth/useAuth";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // @ts-ignore
  const { userInfo } = useAuth();
  // @ts-ignore
  const isAdmin = userInfo?.role === 'admin';
  const { openModal } = useCustomModal();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 50 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      
      const res = await userService.list(params);
      if (res && res.data) {
          // Gestion structure paginée vs simple
          let list: User[] = [];
          if (Array.isArray(res.data)) list = res.data;
          // @ts-ignore
          else if (res.data.data && Array.isArray(res.data.data)) list = res.data.data;
          setUsers(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleDelete = (user: User) => {
      openModal({
          title: "Supprimer l'utilisateur",
          description: `Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`,
          variant: "error",
          primaryLabel: "Supprimer",
          primaryAction: async () => {
              try {
                  await userService.delete(user.id);
                  openModal({ title: "Succès", description: "Utilisateur supprimé", variant: "success" });
                  loadUsers();
              } catch (e) {
                  openModal({ title: "Erreur", description: "Impossible de supprimer l'utilisateur", variant: "error" });
              }
          }
      })
  }

  const getRoleBadge = (role: string) => {
      let classes = "px-2 py-1 rounded text-xs font-semibold ";
      switch(role) {
          case 'admin': classes += "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"; break;
          case 'directeur': classes += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"; break;
          case 'enseignant': classes += "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"; break;
          case 'secretaire': classes += "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"; break;
          case 'eleve': classes += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"; break;
          default: classes += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"; break;
      }
      return <span className={classes}>{role.toUpperCase()}</span>;
  }

  return (
    <>
      <PageMeta title="Gestion des Utilisateurs" description="Liste des utilisateurs" />
      <PageBreadcrumb pageTitle="Gestion des Utilisateurs" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-4 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="border rounded px-3 py-2 text-sm w-full md:w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:border-brand-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select 
                    className="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:border-brand-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Tous les rôles</option>
                    <option value="directeur">Directeur</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="eleve">Élève</option>
                    <option value="parent">Parent</option>
                    {isAdmin && <option value="admin">Admin</option>}
                </select>
            </div>
            
            <Button onClick={loadUsers} variant="outline" size="sm">Actualiser</Button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">Nom</th>
                        <th className="px-6 py-3">Email / Téléphone</th>
                        <th className="px-6 py-3">Rôle</th>
                        <th className="px-6 py-3">École</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-4">Chargement...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-4">Aucun utilisateur trouvé.</td></tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span>{user.email}</span>
                                        <span className="text-xs text-gray-400">{user.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4">
                                    {user.school ? user.school.name : (user.role === 'admin' ? 'Toutes' : '-')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* @ts-ignore */}
                                    {user.id !== userInfo?.id && (
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>
                                            Supprimer
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </>
  );
}
