import "./react-select.scss";
import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import Select from "react-select";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../../components/logger/Logger";
import "./side-panel.scss";

const filterOptions = [
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
  { value: "none", label: "All" },
];

export default function SidePanel() {
  const { responseModality, connected, client } = useLiveAPIContext();
  const [open, setOpen] = useState(true);
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  useEffect(() => {
    if (responseModality === "text") {
      setOpen(true);
      setSelectedOption(filterOptions[0]);
    } else {
      setOpen(false);
      setSelectedOption(filterOptions[2]);
    }
  }, [responseModality]);

  // Listen for log events and store them
  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

  const handleSubmit = () => {
    client.send([{ text: textInput }]);

    setTextInput("");
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
  };

  return (
    <div
      className={`bg-[var(--Neutral-00)] flex flex-col h-screen border-r border-[var(--gray-600)] text-[var(--Neutral-90)] font-sans text-sm font-normal leading-[160%] transition-all duration-200 ease-in-out ${open ? "w-[50%]" : "w-10"}`}
    >
      <header className="flex justify-between items-center border-b border-[var(--Neutral-20)] p-3">
        <h2
          className={`text-[var(--Neutral-90)] font-['Google_Sans'] text-xl font-medium leading-6 transition-opacity duration-200 ${
            open ? "opacity-100 visible" : "opacity-0 invisible w-0"
          }`}
        >
          Chat
        </h2>
        <button
          className="h-8 flex items-center justify-center transition-transform duration-200"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? (
            <RiSidebarFoldLine color="#b4b8bb" />
          ) : (
            <RiSidebarUnfoldLine color="#b4b8bb" />
          )}
        </button>
      </header>

      <section
        className={`flex flex-col gap-3 px-4 py-3 transition-opacity duration-200 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible h-0 overflow-hidden"
        }`}
      >
        <Select
          className="react-select w-full"
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              background: "var(--Neutral-15)",
              color: "var(--Neutral-90)",
              minHeight: "33px",
              maxHeight: "33px",
              border: 0,
              width: "100%",
            }),
            singleValue: (baseStyles) => ({
              ...baseStyles,
              color: "var(--Neutral-90)",
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              background: "var(--Neutral-20)",
              color: "var(--Neutral-90)",
            }),
            option: (styles, { isFocused, isSelected }) => ({
              ...styles,
              backgroundColor: isFocused
                ? "var(--Neutral-30)"
                : isSelected
                  ? "var(--Neutral-20)"
                  : undefined,
            }),
          }}
          value={selectedOption}
          options={filterOptions}
          onChange={(e) => {
            setSelectedOption(e);
          }}
        />
        <div
          className={`select-none rounded border border-[var(--Neutral-20)] bg-[var(--Neutral-10)] flex h-[33px] justify-center items-center gap-1.5 px-2 text-center font-['Space_Mono'] text-sm font-normal w-full ${
            connected ? "text-[var(--Blue-500)]" : ""
          }`}
        >
          {connected ? "🔵 Streaming" : "⏸️ Paused"}
        </div>
      </section>

      <div
        className={`flex-grow overflow-x-hidden overflow-y-auto transition-all duration-200 ${
          !open ? "opacity-0 invisible w-0" : "opacity-100 visible"
        }`}
        ref={loggerRef}
      >
        <Logger
          filter={(selectedOption?.value as LoggerFilterType) || "none"}
        />
      </div>

      <div
        className={`border-t border-[var(--Neutral-20)] px-4 py-3 ${
          !open ? "opacity-0 invisible h-0 overflow-hidden" : ""
        } ${!connected ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="relative bg-[var(--Neutral-10)] border border-[var(--Neutral-15)] rounded-lg p-2 min-h-[40px]">
          <textarea
            className="bg-transparent text-[var(--Neutral-90)] absolute top-0 left-0 right-[40px] h-full outline-none py-2 px-4 border-0 resize-none w-[calc(100%-40px)]"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
            rows={1}
          ></textarea>
          <span
            className={`absolute left-4 top-2 text-[var(--Neutral-50)] pointer-events-none select-none ${
              textInput.length ? "hidden" : ""
            }`}
          >
            Type something...
          </span>

          <button
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-transparent border-0 text-[var(--Neutral-40)] cursor-pointer transition-colors duration-100 ease-in hover:text-[var(--Neutral-60)] material-symbols-outlined filled"
            onClick={handleSubmit}
            aria-label="Send message"
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
}
