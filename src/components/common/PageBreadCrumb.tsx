import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-16 bg-warning-500 rounded-full opacity-60"></div>
      
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <div className="w-1 h-5 bg-warning-500 rounded-full"></div>
        </div>
        <h2
          className="text-2xl font-bold text-gray-800 dark:text-white/90"
        >
          {pageTitle}
        </h2>
      </div>
      
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-warning-600 dark:text-gray-400 dark:hover:text-warning-400 transition-colors"
              to="/"
            >
              Accueil
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="text-sm font-medium text-warning-600 dark:text-warning-400">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
