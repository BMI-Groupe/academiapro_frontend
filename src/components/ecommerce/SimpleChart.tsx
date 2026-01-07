import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SimpleChartProps {
    data: {
        categories: string[];
        series: {
            name: string;
            data: number[];
        }[];
    } | null;
    loading?: boolean;
    height?: number;
}

export default function SimpleChart({ data, loading, height = 300 }: SimpleChartProps) {
  
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: height,
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
            height: height - 50,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: height,
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
          <div className="animate-pulse h-full">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
              <div className="h-full bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
      );
  }

  return (
    <div className="w-full h-full">
      <Chart
        options={options}
        series={series}
        type="area"
        height={height}
      />
    </div>
  );
}

