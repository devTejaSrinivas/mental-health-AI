import React, { useState } from "react";
import {
  AlertCircle,
  FileText,
  Maximize2,
  Share2,
  Brain,
  MessageSquare,
} from "lucide-react";
import InfoCard from "./InfoCard";

const InfoCardGrid = ({ analysisData }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const {
    concern_categories = {},
    concerns = [],
    intensity_scores = {},
    keywords = [],
    response_message = "",
    sentiment = "",
  } = analysisData;

  const fallbackMessages = {
    concerns: "No concerns found",
    keywords: "No keywords found",
    response_message: "No response available",
    sentiment: "No sentiment detected",
    concern_categories: "No concern categories available",
    intensity_scores: "No intensity scores available",
  };

  const cards = [
    {
      title: "Concern Categories",
      content:
        Object.keys(concern_categories).length > 0
          ? Object.entries(concern_categories)
          : fallbackMessages.concern_categories,
      icon: <AlertCircle className="w-6 h-6" />,
      color: "blue",
    },
    {
      title: "Concerns",
      content: concerns.length > 0 ? concerns : fallbackMessages.concerns,
      icon: <FileText className="w-6 h-6" />,
      color: "indigo",
    },
    {
      title: "Intensity Scores",
      content:
        Object.keys(intensity_scores).length > 0
          ? Object.entries(intensity_scores)
          : fallbackMessages.intensity_scores,
      icon: <Maximize2 className="w-6 h-6" />,
      color: "purple",
    },
    {
      title: "Keywords",
      content: keywords.length > 0 ? keywords : fallbackMessages.keywords,
      icon: <Share2 className="w-6 h-6" />,
      color: "pink",
    },
    {
      title: "Sentiment",
      content: sentiment || fallbackMessages.sentiment,
      icon: <Brain className="w-6 h-6" />,
      color: sentiment === "Negative" ? "red" : "green",
    },
    {
      title: "Response",
      content: response_message || fallbackMessages.response_message,
      icon: <MessageSquare className="w-6 h-6" />,
      color: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <InfoCard
          key={index}
          title={card.title}
          content={card.content}
          icon={card.icon}
          color={card.color}
          index={index}
          isSelected={selectedCard === index}
          onSelect={() =>
            setSelectedCard(selectedCard === index ? null : index)
          }
        />
      ))}
    </div>
  );
};

export default InfoCardGrid;
