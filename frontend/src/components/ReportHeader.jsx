// components/ReportHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCcw, Download } from "lucide-react";
import { brainwaveSymbol } from "../assets";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReportHeader = ({ lastUpdate, onRefresh }) => {
  const handleExport = async () => {
    const reportElement = document.getElementById("report-container");
    const canvas = await html2canvas(reportElement);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`patient-report-${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.img
            src={brainwaveSymbol}
            alt="Brainwave"
            className="w-16 h-16"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
          <div>
            <h2 className="text-4xl font-bold text-gray-100">Patient Report</h2>
            <p className="text-gray-300 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-700 text-lg text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
            onClick={onRefresh}
          >
            <RefreshCcw className="w-5 h-5" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-600 text-lg text-white rounded-lg flex items-center gap-2 hover:bg-blue-500"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            Export PDF
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
