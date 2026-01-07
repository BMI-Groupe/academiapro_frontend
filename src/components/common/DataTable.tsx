import React from "react";
import { TrashBinIcon, PencilIcon, EyeIcon } from "../../icons";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  pagination?: PaginationProps;
}

export default function DataTable({ columns, data, loading, onEdit, onDelete, onView, pagination }: DataTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
             {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>)}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-warning-500 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune donnée trouvée.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Les données apparaîtront ici une fois ajoutées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-warning-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-warning-100 dark:border-warning-900/20">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white/90 border-b border-gray-200 dark:border-gray-700"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white/90 border-b border-gray-200 dark:border-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-warning-50/30 dark:hover:bg-warning-900/5 transition-all duration-200 group/row">
                {columns.map((col) => (
                  <td
                    key={`${item.id || idx}-${col.key}`}
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
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200 group/btn"
                          title="Voir détails"
                        >
                          <EyeIcon className="size-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg text-gray-500 hover:text-warning-600 hover:bg-warning-50 dark:text-gray-400 dark:hover:text-warning-400 dark:hover:bg-warning-900/20 transition-all duration-200 group/btn"
                          title="Éditer"
                        >
                          <PencilIcon className="size-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 group/btn"
                          title="Supprimer"
                        >
                          <TrashBinIcon className="size-5 group-hover/btn:scale-110 transition-transform" />
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Affichage de <span className="font-semibold text-brand-600 dark:text-brand-400">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> à <span className="font-semibold text-brand-600 dark:text-brand-400">{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}</span> sur <span className="font-semibold text-warning-600 dark:text-warning-400">{pagination.totalItems}</span> résultats
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-warning-50 hover:text-warning-600 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-warning-900/20 dark:hover:text-warning-400 transition-colors"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Pages Logic Simplifiée */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Afficher les premières, dernières, et autour de la courante
                    if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                    ) {
                        return (
                            <button
                                key={pageNum}
                                onClick={() => pagination.onPageChange(pageNum)}
                                aria-current={pagination.currentPage === pageNum ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    pagination.currentPage === pageNum
                                        ? 'bg-brand-500 text-white shadow-md focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ring-2 ring-warning-300 ring-offset-1'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-warning-50 hover:text-warning-600 hover:ring-warning-200 focus:z-20 focus:outline-offset-0 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-warning-900/20 dark:hover:text-warning-400'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    } else if (
                        pageNum === pagination.currentPage - 2 ||
                        pageNum === pagination.currentPage + 2
                    ) {
                        return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-400 dark:ring-gray-700">...</span>;
                    }
                    return null;
                })}

                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-warning-50 hover:text-warning-600 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-warning-900/20 dark:hover:text-warning-400 transition-colors"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
