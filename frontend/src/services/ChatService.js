import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const setupChatService = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.0-flash-lite",
  });

  const sendMessage = async (message, modelChats) => {
    try {
      // Analyze message with backend
      const analysisResponse = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/process_input`,
        {
          sentence: message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      // Create a new chat with the updated history
      const chat = model.startChat({
        history: modelChats,
      });

      // Send the message and get the response
      const result = await chat.sendMessage(message);
      const textResponse = result.response.text();

      return {
        analysisData: analysisResponse.data,
        botResponse: textResponse
      };
    } catch (error) {
      console.error("Error in chat service:", error);
      throw error;
    }
  };

  return { sendMessage };
};

export const createMessage = (id, text, sender) => {
  return {
    id,
    text,
    sender,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};