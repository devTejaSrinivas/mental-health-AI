import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Search,
  Send,
  Settings,
  Users,
  Menu,
  X,
} from "lucide-react";
import { brainwaveSymbol } from "../assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function ChatPage() {
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [activeChat, setActiveChat] = useState(1);
  const [loading, setLoading] = useState(false);
  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.0-flash-lite",
  });

  // Initial context prompt
  const contextPrompt =
    "You now need to act like a professional mental health expert and figure out all the emotions of the user by asking a set of questions one by one (have a genuine and purposeful conversation and DO NOT ASK ALL OF YOUR QUESTIONS AT ONCE), so ask the questions carefully so you can extract feelings from the user. Once you believe the conversation is worth ending, say thank you and ask the user to generate their report but before that keep your messages concise(max 20 words only don't exceed), and also ask subsequent questions do not give any recommendations on what to do just do your best to discover the emotions of the user.";

  // Load model chats from localStorage for Gemini API conversation history
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

  // Load chats from localStorage on component mount
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
            avatar: { brainwaveSymbol },
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

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  // Save chats and modelChats to localStorage and scroll to bottom whenever they change
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("modelChats", JSON.stringify(modelChats));
    scrollToBottom();
  }, [chats, modelChats]);

  const activeConversation = chats.find((chat) => chat.id === activeChat);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    setLoading(true);

    const userMessage = {
      id: activeConversation.messages.length + 1,
      text: currentMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

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
      const response = await axios.post(
        "https://mental-health-ai-rilr.onrender.com/api/process_input",
        {
          sentence: userMessage.text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      setAnalysisData(response.data);
      console.log(response.data);

      // Create a new chat with the updated history
      const chat = model.startChat({
        history: updatedModelChats,
      });

      // Send the message and get the response
      const result = await chat.sendMessage(userMessage.text);
      const textres = result.response.text();

      // Create bot message for UI
      const botMessage = {
        id: activeConversation.messages.length + 2,
        text: textres,
        sender: "other",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

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
          parts: [{ text: textres }],
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

  // Instead of allowing default <p> tags, you can use a div or other element
  const components = {
    p: ({node, ...props}) => <div className="paragraph" {...props} />
  }

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
      </div>

      <div className="flex-1 flex flex-col h-full">
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

        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900"
        >
          {activeConversation.messages.map((message) => (
            <div
              key={message.id}
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
      </div>
    </div>
  );
}

export default ChatPage;
