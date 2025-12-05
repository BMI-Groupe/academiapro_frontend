import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import axiosInstance from "../../../api/axios"; // Remplacez par le chemin correct

interface User {
  id: string;
  phone: string;
  role: string;
  firstname: string;
  lastname: string;
  name: string;
}

export default function UsersTableOne() {
  const [tableData, setTableData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/users");
        const transformedData: User[] = data.map((item: any) => ({
          id: item.id,
          phone: item.phone,
          role: item.role.name,
          firstname: item.firstname,
          lastname: item.lastname,
          name: `${item.firstname} ${item.lastname}`,
        }));
        setTableData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setTimeout(() => setIsModalVisible(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // @ts-ignore
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Utilisateur
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Téléphone
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Poste
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.length === 0 ? (
              <TableRow>
                {/*@ts-ignore*/}
                <TableCell colSpan={4} className="px-5 py-4 text-center">
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {user.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.role}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Voir détails
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modale pour afficher les détails */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className={`bg-white dark:bg-white/[0.03] rounded-lg p-6 max-w-md w-full shadow-lg transition-all duration-700 ease-in-out ${
              isModalVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
              Détails de l'utilisateur 
            </h3>
            <div className="space-y-2">
              {/* <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">ID :</span> {selectedUser.id}
              </p> */}
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Nom complet :</span> {selectedUser.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Prénom :</span> {selectedUser.firstname}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Nom :</span> {selectedUser.lastname}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Téléphone :</span> {selectedUser.phone}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Poste :</span> {selectedUser.role}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}