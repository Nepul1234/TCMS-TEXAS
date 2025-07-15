import Chart from "react-apexcharts";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, MoreHorizontal, TrendingUp } from "lucide-react";

export default function MonthlyTarget() {
  const series = [75.55];

  const options = {
    colors: ["#6366F1"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "75%",
          background: "#F9FAFB",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "97%",
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.05
          }
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "38px",
            fontWeight: "700",
            offsetY: -10,
            color: "#1E293B",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#818CF8"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      },
    },
    stroke: {
      lineCap: "round",
      dashArray: 0,
    },
    labels: ["Progress"],
  };

  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function selectPeriod(period) {
    setSelectedPeriod(period);
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Progress towards your monthly goal
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span>{selectedPeriod}</span>
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  {["This Week", "This Month", "This Quarter", "This Year"].map((period) => (
                    <button
                      key={period}
                      onClick={() => selectPeriod(period)}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        selectedPeriod === period 
                          ? "bg-indigo-50 text-indigo-700" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <div className="w-full px-4">
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height={330}
          />
        </div>
        
        <div className="mt-2 w-full px-6 pb-6">
          <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Rs. 32,870</p>
                  <p className="text-sm text-gray-500">earned today</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                <ArrowUpRight className="h-3 w-3" />
                <span>12.5%</span>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-gray-600">
              Your earnings are higher than last month. Keep up your good work!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}