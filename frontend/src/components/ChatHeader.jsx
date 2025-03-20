import React from "react";
import { Users } from "lucide-react";

const ChatHeader = ({ activeConversation, brainwaveSymbol }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={brainwaveSymbol}
          alt={activeConversation.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-white">
            {activeConversation.name}
          </h2>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>
      <button className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
        <Users size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;