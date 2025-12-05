import React from "react";
import { TrashBinIcon, PencilIcon, EyeIcon } from "../../icons";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
}

export default function DataTable({ columns, data, loading, onEdit, onDelete, onView }: DataTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-gray-500">Aucune donnée.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white/90"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white/90">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${col.key}`}
                    className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="text-gray-500 hover:text-gray-600 dark:text-gray-400"
                          title="Voir détails"
                        >
                          <EyeIcon className="size-5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                          title="Éditer"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-error-500 hover:text-error-600 dark:text-error-400"
                          title="Supprimer"
                        >
                          <TrashBinIcon className="size-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
