// components/EmptyStateMessage.jsx
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";

const EmptyStateMessage = ({ navigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-gray-800 rounded-xl shadow-lg"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          No Data Available
        </h2>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 mx-auto"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </button>
      </motion.div>
    </div>
  );
};

export default EmptyStateMessage;
