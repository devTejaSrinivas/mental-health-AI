import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { brainwaveSymbol } from "../assets";

// Import components
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

// Import services and hooks
import { setupChatService, createMessage } from "../services/ChatService";
import { useChats, useModelChats } from "../hooks/ChatHooks";

function ChatPage() {
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [activeChat, setActiveChat] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Initial context prompt
  const contextPrompt =
    "You now need to act like a professional mental health expert and figure out all the emotions of the user by asking a set of questions one by one (have a genuine and purposeful conversation and DO NOT ASK ALL OF YOUR QUESTIONS AT ONCE), so ask the questions carefully so you can extract feelings from the user. Once you believe the conversation is worth ending, say thank you and ask the user to generate their report but before that keep your messages concise(max 20 words only don't exceed), and also ask subsequent questions do not give any recommendations on what to do just do your best to discover the emotions of the user.";

  // Setup chat service
  const chatService = setupChatService(import.meta.env.VITE_GEMINI_API_KEY);
  
  // Use custom hooks
  const [chats, setChats] = useChats();
  const [modelChats, setModelChats] = useModelChats(contextPrompt);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom whenever chats change
  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const activeConversation = chats.find((chat) => chat.id === activeChat);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    setLoading(true);

    // Create user message
    const userMessage = createMessage(
      activeConversation.messages.length + 1,
      currentMessage,
      "user"
    );

    // Update chats state with user message
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage],
            lastMessage: currentMessage,
          };
        }
        return chat;
      })
    );

    // Update modelChats with user message
    const updatedModelChats = [
      ...modelChats,
      {
        role: "user",
        parts: [{ text: currentMessage }],
      },
    ];
    setModelChats(updatedModelChats);

    setCurrentMessage("");

    try {
      // Send message and get response using chat service
      const { analysisData, botResponse } = await chatService.sendMessage(
        userMessage.text,
        updatedModelChats
      );

      setAnalysisData(analysisData);
      console.log(analysisData);

      // Create bot message for UI
      const botMessage = createMessage(
        activeConversation.messages.length + 2,
        botResponse,
        "other"
      );

      // Update chats with bot response
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );

      // Update modelChats with bot response
      setModelChats([
        ...updatedModelChats,
        {
          role: "model",
          parts: [{ text: botResponse }],
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Consider adding error handling UI feedback here
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unread: 0 } : chat
      )
    );
  };

  return (
    <div className="h-screen flex bg-gray-900">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transform transition-transform duration-300 ease-in-out 
        fixed lg:relative w-80 h-full bg-gray-800 border-r border-gray-700 z-40`}
      >
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          handleChatSelect={handleChatSelect}
          brainwaveSymbol={brainwaveSymbol}
          analysisData={analysisData}
          navigate={navigate}
        />
      </div>

      <div className="flex-1 flex flex-col h-full">
        <ChatHeader 
          activeConversation={activeConversation}
          brainwaveSymbol={brainwaveSymbol}
        />
        
        <MessageList
          messages={activeConversation.messages}
          loading={loading}
          messageContainerRef={messageContainerRef}
        />
        
        <MessageInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          analysisData={analysisData}
          navigate={navigate}
          brainwaveSymbol={brainwaveSymbol}
        />
      </div>
    </div>
  );
}

export default ChatPage;