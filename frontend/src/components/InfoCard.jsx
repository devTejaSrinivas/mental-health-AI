// components/InfoCard.jsx
import React from "react";
import { motion } from "framer-motion";

const InfoCard = ({
  title,
  content,
  icon,
  color,
  index,
  isSelected,
  onSelect,
}) => {
  const cardColors = {
    blue: {
      bg: "bg-blue-900",
      text: "text-blue-100",
      hover: "hover:bg-blue-800",
    },
    indigo: {
      bg: "bg-indigo-900",
      text: "text-indigo-100",
      hover: "hover:bg-indigo-800",
    },
    purple: {
      bg: "bg-purple-900",
      text: "text-purple-100",
      hover: "hover:bg-purple-800",
    },
    pink: {
      bg: "bg-pink-900",
      text: "text-pink-100",
      hover: "hover:bg-pink-800",
    },
    green: {
      bg: "bg-green-900",
      text: "text-green-100",
      hover: "hover:bg-green-800",
    },
    red: {
      bg: "bg-red-900",
      text: "text-red-100",
      hover: "hover:bg-red-800",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer
        ${isSelected ? "ring-2 ring-blue-400" : ""}
        hover:shadow-xl transition-all duration-300`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${cardColors[color].bg}`}>
          {React.cloneElement(icon, {
            className: cardColors[color].text,
          })}
        </div>
        <h3 className={`text-xl font-semibold text-gray-100`}>{title}</h3>
      </div>
      <div className="space-y-3">
        {content ? (
          Array.isArray(content) ? (
            content.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-lg text-gray-300"
              >
                {Array.isArray(item) ? (
                  <span>
                    {item[0]}: {item[1]}
                  </span>
                ) : (
                  <span>{item}</span>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-lg text-gray-300">{content}</div>
          )
        ) : (
          <p className="text-lg text-gray-500">No data available</p>
        )}
      </div>
    </motion.div>
  );
};

export default InfoCard;
