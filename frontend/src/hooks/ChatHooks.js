import { useState, useEffect } from "react";

// Custom hook for managing chats
export const useChats = () => {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("chats");
    return savedChats
      ? JSON.parse(savedChats)
      : [
          {
            id: 1,
            name: "KalRav",
            lastMessage: "",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: 2,
            avatar: "brainwaveSymbol",
            messages: [
              {
                id: 1,
                text: "Hi there! How are you feeling today?",
                sender: "other",
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  return [chats, setChats];
};

// Custom hook for managing model chats
export const useModelChats = (contextPrompt) => {
  const [modelChats, setModelChats] = useState(() => {
    const savedModelChats = localStorage.getItem("modelChats");
    return savedModelChats
      ? JSON.parse(savedModelChats)
      : [
          {
            role: "user",
            parts: [{ text: contextPrompt }],
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("modelChats", JSON.stringify(modelChats));
  }, [modelChats]);

  return [modelChats, setModelChats];
};