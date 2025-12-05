import React from 'react';
import Label from '../form/Label';

interface SchoolYearFilterProps {
  value: any;
  onChange: (year: any) => void;
  years: any[];
  loading?: boolean;
  showAll?: boolean;
  className?: string;
}

export default function SchoolYearFilter({
  value,
  onChange,
  years,
  loading = false,
  showAll = false,
  className = '',
}: SchoolYearFilterProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="schoolYearFilter">Année scolaire</Label>
      <select
        id="schoolYearFilter"
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={value?.id || ''}
        onChange={(e) => {
          const selectedYear = years.find(y => y.id === parseInt(e.target.value));
          onChange(selectedYear);
        }}
        disabled={loading}
      >
        {showAll && <option value="">Toutes les années</option>}
        {years.map(year => (
          <option key={year.id} value={year.id}>
            {year.label} {year.is_active ? '(Active)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
