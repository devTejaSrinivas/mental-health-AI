// components/IntensityChart.jsx
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { motion } from "framer-motion";
import { Brain, RefreshCcw, ChevronDown } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const IntensityChart = ({ chartData, loading, timeframe, setTimeframe }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setIsDropdownOpen(false);
  };

  const timeframeOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const getTimeframeLabel = () => {
    const option = timeframeOptions.find(
      (option) => option.value === timeframe
    );
    return option ? option.label : "Daily";
  };

  // Dynamically adjust time unit based on timeframe selection
  const getTimeUnit = () => {
    switch (timeframe) {
      case "weekly":
        return "day";
      case "monthly":
        return "week";
      default:
        return "minute";
    }
  };

  const data = {
    datasets: [
      {
        label: "Intensity Over Time",
        data: chartData,
        borderColor: "#60A5FA",
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: getTimeUnit(),
          tooltipFormat: "yyyy-MM-dd HH:mm:ss",
          displayFormats: {
            minute: "HH:mm:ss",
            hour: "HH:mm",
            day: "MMM d",
            week: "MMM d",
          },
        },
        title: {
          display: true,
          text: "Time",
          font: { weight: "bold", size: 14 },
          color: "#E5E7EB",
        },
        ticks: {
          color: "#E5E7EB",
          font: { size: 12 },
        },
        grid: {
          color: "#374151",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Intensity",
          font: { weight: "bold", size: 14 },
          color: "#E5E7EB",
        },
        ticks: {
          color: "#E5E7EB",
          font: { size: 12 },
        },
        grid: {
          color: "#374151",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#E5E7EB",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: `${getTimeframeLabel()} Intensity Analysis`,
        color: "#E5E7EB",
        font: { size: 16, weight: "bold" },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-400" />
          Intensity Analysis Over Time
        </h3>

        {/* Timeframe Dropdown */}
        <div className="flex justify-center items-center w-full mb-4">
          <div className="relative">
            <button
              className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {getTimeframeLabel()}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-4 mt-2 w-36 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="block w-full text-left px-4 py-2 text-gray-100 hover:bg-gray-600 transition-colors"
                    onClick={() => handleTimeframeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-300 text-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.div>
            Updating...
          </div>
        )}
      </div>
      <div className="h-96">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default IntensityChart;
