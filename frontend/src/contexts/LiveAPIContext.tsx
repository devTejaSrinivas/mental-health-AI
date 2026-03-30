import { createContext, FC, ReactNode, useContext, useState } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api";
import { LiveClientOptions } from "../types";

interface LiveAPIContextType extends UseLiveAPIResults {
  responseModality: "text" | "audio" | "image";
  setResponseModality: (m: "text" | "audio" | "image") => void;
}

const LiveAPIContext = createContext<LiveAPIContextType | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: ReactNode;
  options: LiveClientOptions;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  options,
  children,
}) => {
  if (!options || !options.apiKey) {
    console.error("LiveAPIProvider: Missing API key in options");
    return null;
  }

  const liveAPI = useLiveAPI(options);
  const [responseModality, setResponseModality] = useState<
    "text" | "audio" | "image"
  >("audio");

  return (
    <LiveAPIContext.Provider
      value={{ ...liveAPI, responseModality, setResponseModality }}
    >
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};
