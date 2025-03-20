import React from "react";
import { Settings, MessageSquare } from "lucide-react";

const Sidebar = ({ 
  chats, 
  activeChat, 
  handleChatSelect, 
  brainwaveSymbol, 
  analysisData, 
  navigate 
}) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-blue-400" /> Kalrav
        </h1>
        <button className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
          <Settings size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
              activeChat === chat.id ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => handleChatSelect(chat.id)}
          >
            <img
              src={brainwaveSymbol}
              alt={chat.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white truncate">
                  {chat.name}
                </h3>
                <span className="text-sm text-gray-400">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {chat.unread}
              </span>
            )}
          </div>
        ))}

        {analysisData && (
          <button
            className="bg-purple-800 text-white text-2xl p-2 rounded-lg mx-auto inline-flex w-full justify-center"
            onClick={() => navigate("/report", { state: { analysisData } })}
          >
            <img
              src={brainwaveSymbol}
              className="w-10 h-10 rounded-full object-cover mr-1"
            />
            <div className="mt-0.5">Report</div>
          </button>
        )}

        <button
          className="bg-red-800 text-white text-2xl p-2 rounded-lg mx-auto inline-flex w-full justify-center"
          onClick={() => navigate("/signin")}
        >
          <img
            src={brainwaveSymbol}
            className="w-10 h-10 rounded-full object-cover mr-1"
          />
          <div className="mt-0.5">signout</div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;