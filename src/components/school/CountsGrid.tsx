import React from "react";

interface CountsGridProps {
  stats: {
    classes: number;
    students: number;
    teachers: number;
  } | null;
  loading?: boolean;
}

export default function CountsGrid({ stats, loading }: CountsGridProps) {
  const counts = stats || { classes: 0, students: 0, teachers: 0 };

  if (loading) {
      return <div className="grid grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
             <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        ))}
      </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Classes</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{counts.classes}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Élèves</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{counts.students}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Enseignants</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{counts.teachers}</p>
      </div>
    </div>
  );
}
