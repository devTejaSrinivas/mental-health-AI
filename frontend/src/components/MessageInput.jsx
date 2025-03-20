import React from "react";
import { Send } from "lucide-react";

const MessageInput = ({ 
  currentMessage, 
  setCurrentMessage, 
  handleSendMessage, 
  analysisData, 
  navigate, 
  brainwaveSymbol 
}) => {
  return (
    <form
      onSubmit={handleSendMessage}
      className="bg-gray-800 border-t border-gray-700 p-4 flex gap-4"
    >
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Send size={20} />
      </button>

      {analysisData && (
        <button
          className="bg-purple-800 text-white text-2xl p-2 rounded-lg mx-auto inline-flex justify-center"
          onClick={() => navigate("/report", { state: { analysisData } })}
        >
          <img
            src={brainwaveSymbol}
            className="w-10 h-10 rounded-full object-cover mr-1"
          />
          <div className="mt-0.5">Report</div>
        </button>
      )}
    </form>
  );
};

export default MessageInput;