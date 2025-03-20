import React from "react";
import Message from "./Message";

const MessageList = ({ messages, loading, messageContainerRef }) => {
  return (
    <div
      ref={messageContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      
      {loading && (
        <div className="mr-auto bg-gray-800 text-white p-3 rounded-lg flex items-center space-x-2 max-w-[15%]">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">Thinking...</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;