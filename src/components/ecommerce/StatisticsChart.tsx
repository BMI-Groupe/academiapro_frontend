import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface StatisticsChartProps {
    data: {
        categories: string[];
        series: {
            name: string;
            data: number[];
        }[];
    } | null;
    loading?: boolean;
}

export default function StatisticsChart({ data, loading }: StatisticsChartProps) {
  
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "straight",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3056D3", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: data?.categories || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
    },
  };

  const series = data?.series || [{name: 'Inscriptions', data: []}, {name: 'Paiements', data: []}];

  if (loading) {
      return (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-7 pb-5 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5 animate-pulse h-[350px]">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-8 rounded"></div>
              <div className="h-4/5 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
      );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-7 pb-5 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Aperçu Annuel</p>
              <p className="text-sm font-medium">Inscriptions & Paiements</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <Chart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
