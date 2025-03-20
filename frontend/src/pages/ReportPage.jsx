// ReportPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";

import ReportHeader from "../components/ReportHeader";
import IntensityChart from "../components/IntensityChart";
import InfoCardGrid from "../components/InfoCardGrid";
import EmptyStateMessage from "../components/EmptyStateMessage";

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [timeframe, setTimeframe] = useState("daily");
  const analysisData = location.state?.analysisData || {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/intensity-history?timeframe=${timeframe}`
      );
      const data = await response.json();

      if (
        data?.history &&
        Array.isArray(data.history) &&
        data.history.length > 0
      ) {
        const formattedData = data.history.flatMap((entry) => ({
          x: new Date(entry.timestamp),
          y: entry.intensity_scores?.[0]?.score || 0,
          concern: entry.intensity_scores?.[0]?.concern,
        }));
        setChartData(formattedData);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching intensity data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [timeframe]);

  if (!analysisData || Object.keys(analysisData).length === 0) {
    return <EmptyStateMessage navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <motion.div
        id="report-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <ReportHeader lastUpdate={lastUpdate} onRefresh={fetchData} />

        <IntensityChart
          chartData={chartData}
          loading={loading}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />

        <InfoCardGrid analysisData={analysisData} />

        <BackButton navigate={navigate} />
      </motion.div>
    </div>
  );
};

const BackButton = ({ navigate }) => (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-6 px-6 py-3 bg-blue-600 text-lg text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
    onClick={() => navigate(-1)}
  >
    <ArrowLeft className="w-5 h-5" />
    Back to Chat
  </motion.button>
);

export default ReportPage;
