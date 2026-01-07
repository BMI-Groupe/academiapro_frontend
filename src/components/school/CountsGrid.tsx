import React from "react";
import { useCountAnimation } from "../../hooks/useCountAnimation";
import { GroupIcon, UserIcon, UserCircleIcon } from "../../icons";

interface CountsGridProps {
  stats: {
    classes: number;
    students: number;
    teachers: number;
  } | null;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, color, bgColor, loading }: StatCardProps) {
  const animatedCount = useCountAnimation({ 
    targetValue: value, 
    duration: 1500,
    enabled: !loading && value > 0
  });

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Gradient background effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${bgColor}`}></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color} transition-all duration-300`}>
            {loading ? (
              <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
            ) : (
              <span className="tabular-nums">{animatedCount.toLocaleString()}</span>
            )}
          </p>
        </div>
        
        {/* Icon */}
        <div className={`${bgColor} p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center`}>
          <div className="w-6 h-6 flex items-center justify-center">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
              className: "w-full h-full fill-current"
            }) : icon}
          </div>
        </div>
      </div>
      
      {/* Decorative line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </div>
  );
}

export default function CountsGrid({ stats, loading }: CountsGridProps) {
  const counts = stats || { classes: 0, students: 0, teachers: 0 };

  if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          ))}
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Classes"
        value={counts.classes}
        icon={<GroupIcon className="w-full h-full" />}
        color="text-blue-600 dark:text-blue-400"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        loading={loading}
      />

      <StatCard
        label="Élèves"
        value={counts.students}
        icon={<UserIcon className="w-full h-full" />}
        color="text-green-600 dark:text-green-400"
        bgColor="bg-green-100 dark:bg-green-900/30"
        loading={loading}
      />

      <StatCard
        label="Enseignants"
        value={counts.teachers}
        icon={<UserCircleIcon className="w-full h-full" />}
        color="text-purple-600 dark:text-purple-400"
        bgColor="bg-purple-100 dark:bg-purple-900/30"
        loading={loading}
      />
    </div>
  );
}
