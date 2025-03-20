import React from "react";
import ReactMarkdown from "react-markdown";

const Message = ({ message }) => {
  // Custom components for ReactMarkdown
  const components = {
    p: ({node, ...props}) => <div className="paragraph" {...props} />
  };

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] ${
          message.sender === "user"
            ? "bg-blue-600 text-white rounded-l-lg rounded-tr-lg"
            : "bg-gray-800 text-white rounded-r-lg rounded-tl-lg"
        } px-4 py-2`}
      >
        <ReactMarkdown components={components}>
          {message.text}
        </ReactMarkdown>
        <span
          className={`text-xs ${
            message.sender === "user"
              ? "text-blue-200"
              : "text-gray-400"
          } block mt-1`}
        >
          {message.time}
        </span>
      </div>
    </div>
  );
};

export default Message;