"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "katex/dist/katex.min.css";

const modes = [
  "General AI Chat", "Research Assistant", "Education Engine",
  "SAT Practice", "ACT Practice", "GRE Practice", "GMAT Practice",
  "LSAT Practice", "MCAT Practice", "Olympiads", "AP Exams",
  "WAEC Practice", "JAMB Practice", "IGCSE Practice", "A-Level Practice",
  "Mathematics", "Pure Mathematics", "Applied Mathematics",
  "Academic Writing", "SOA Exam P", "SOA Exam FM", "IFOA CS1", "IFOA CM1",
  "Statistics", "Finance", "CFA Exam", "Accounting", "ICAN Exam",
  "Economics", "Actuarial Science", "Physics", "Chemistry", "Engineering",
  "Computer Science", "Data Science", "AI & Machine Learning",
  "Practice Questions", "File Analysis", "Stock Analysis",
];

type Message = { role: "user" | "assistant"; text: string };

type ChatSession = {
  id: string;
  title: string;
  mode: string;
  messages: Message[];
  updatedAt: number;
};

const welcomeMessage: Message = {
  role: "assistant",
  text: "Welcome to Quant GPT! I am an AI Engine Developed by YomiAnnixs. Feel free to inquire about topics in mathematics, finance, actuarial science, accounting, CFA, ICAN, economics, data analysis, research, coding, exam prep, Olympiads, or stock analysis.",
};

function createNewChat(): ChatSession {
  return {
    id: Date.now().toString(),
    title: "New Chat",
    mode: "General AI Chat",
    messages: [welcomeMessage],
    updatedAt: Date.now(),
  };
}

function generateTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 34 ? cleaned.slice(0, 34) + "..." : cleaned || "New Chat";
}

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("General AI Chat");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chart, setChart] = useState<string | null>(null);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState("");

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [welcomeMessage];

  useEffect(() => {
    const savedChats = localStorage.getItem("quant-ai-chats");
    const savedActiveChatId = localStorage.getItem("quant-ai-active-chat-id");

    if (savedChats) {
      const parsedChats: ChatSession[] = JSON.parse(savedChats);

      if (parsedChats.length > 0) {
        setChats(parsedChats);

        const activeExists = parsedChats.some((chat) => chat.id === savedActiveChatId);
        const selectedChatId = activeExists ? savedActiveChatId || parsedChats[0].id : parsedChats[0].id;

        setActiveChatId(selectedChatId);

        const selectedChat = parsedChats.find((c) => c.id === selectedChatId);
        if (selectedChat) setMode(selectedChat.mode);

        return;
      }
    }

    const firstChat = createNewChat();
    setChats([firstChat]);
    setActiveChatId(firstChat.id);
    setMode(firstChat.mode);
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("quant-ai-chats", JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("quant-ai-active-chat-id", activeChatId);
    }
  }, [activeChatId]);

  function updateActiveChat(updater: (chat: ChatSession) => ChatSession) {
    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChatId ? updater(chat) : chat))
    );
  }

  function startNewChat() {
    const newChat = createNewChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMode(newChat.mode);
    setMessage("");
    setSelectedFile(null);
    setChart(null);
  }

  function selectChat(chat: ChatSession) {
    setActiveChatId(chat.id);
    setMode(chat.mode);
    setMessage("");
    setSelectedFile(null);
    setChart(null);
  }

  function deleteChat(chatId: string) {
    setChats((prev) => {
      const remaining = prev.filter((chat) => chat.id !== chatId);

      if (remaining.length === 0) {
        const newChat = createNewChat();
        setActiveChatId(newChat.id);
        setMode(newChat.mode);
        return [newChat];
      }

      if (chatId === activeChatId) {
        setActiveChatId(remaining[0].id);
        setMode(remaining[0].mode);
      }

      return remaining;
    });
  }

  function exportChat() {
    if (!activeChat) return;

    const chatText = activeChat.messages
      .map((m) => `## ${m.role === "user" ? "You" : "Quant GPT"}\n\n${m.text}`)
      .join("\n\n---\n\n");

    const blob = new Blob([chatText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function sendMessage() {
    if (!message.trim() || !activeChat) return;

    const currentMessage = message;
    const userMessage: Message = { role: "user", text: currentMessage };
    const assistantMessage: Message = { role: "assistant", text: "" };

    updateActiveChat((chat) => ({
      ...chat,
      title: chat.title === "New Chat" ? generateTitle(currentMessage) : chat.title,
      mode,
      messages: [...chat.messages, userMessage, assistantMessage],
      updatedAt: Date.now(),
    }));

    const historyForBackend = [...messages, userMessage].slice(-12);

    setMessage("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage, mode, history: historyForBackend }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        updateActiveChat((chat) => {
          const updatedMessages = [...chat.messages];
          const lastIndex = updatedMessages.length - 1;

          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            text: updatedMessages[lastIndex].text + chunk,
          };

          return { ...chat, messages: updatedMessages, updatedAt: Date.now() };
        });
      }
    } catch {
      updateActiveChat((chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            text: "Could not connect to backend. Check that FastAPI is running and NEXT_PUBLIC_API_URL is correct.",
          },
        ],
        updatedAt: Date.now(),
      }));
    }

    setLoading(false);
  }

  async function uploadFile() {
    if (!selectedFile || !activeChat) return;

    const fileMessage: Message = {
      role: "user",
      text: `Uploaded file: ${selectedFile.name}`,
    };

    const assistantMessage: Message = {
      role: "assistant",
      text: "",
    };

    updateActiveChat((chat) => ({
      ...chat,
      title: chat.title === "New Chat" ? `File: ${selectedFile.name}` : chat.title,
      mode,
      messages: [...chat.messages, fileMessage, assistantMessage],
      updatedAt: Date.now(),
    }));

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setChart(data.chart || null);

      updateActiveChat((chat) => {
        const updatedMessages = [...chat.messages];
        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          text: data.response || "File uploaded, but no analysis was returned.",
        };

        return { ...chat, messages: updatedMessages, updatedAt: Date.now() };
      });

      setSelectedFile(null);
    } catch {
      updateActiveChat((chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            text: "File upload failed. Check that backend /upload route is working.",
          },
        ],
        updatedAt: Date.now(),
      }));
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-gray-950 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 lg:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quant GPT</h1>
            <p className="text-gray-400 text-sm mb-4">
              One AI for learning, research, analysis and exam prep.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={startNewChat}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold"
            >
              + New Chat
            </button>

            <button
              onClick={exportChat}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 font-semibold"
            >
              ⬇ Export Chat
            </button>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Mode</p>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                updateActiveChat((chat) => ({
                  ...chat,
                  mode: e.target.value,
                  updatedAt: Date.now(),
                }));
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
            >
              {modes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm mb-3">Chats</p>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {[...chats]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 cursor-pointer ${
                      chat.id === activeChatId
                        ? "bg-gray-800"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => selectChat(chat)}
                      className="flex-1 text-left truncate text-sm"
                    >
                      {chat.title}
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="text-gray-500 hover:text-red-400 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="hidden lg:block space-y-3 text-sm text-gray-400 mt-4">
            <p>Core Engines:</p>
            <p>• AI Chat</p>
            <p>• Research Assistant</p>
            <p>• Math & Science Solver</p>
            <p>• Finance & Stock Analysis</p>
            <p>• Accounting / CFA / ICAN</p>
            <p>• Actuarial Science</p>
            <p>• File Intelligence</p>
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-h-[calc(100vh-230px)] lg:min-h-screen">
        <div className="border-b border-gray-800 p-4 lg:p-5">
          <h2 className="text-xl lg:text-2xl font-semibold">
            {activeChat?.title || mode}
          </h2>
          <p className="text-gray-400 text-xs lg:text-sm">
            Mode: {mode} · Connected through NEXT_PUBLIC_API_URL
          </p>
        </div>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full lg:max-w-4xl p-4 rounded-2xl text-sm lg:text-base ${
                msg.role === "user"
                  ? "bg-blue-700 lg:ml-auto"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">
                  {msg.role === "user" ? "You" : "Quant GPT"}
                </p>

                {msg.role === "assistant" && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    📋 Copy
                  </button>
                )}
              </div>

              <div className="whitespace-pre-wrap leading-relaxed break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full lg:max-w-4xl p-4 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">Quant GPT</p>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="px-4 lg:px-5 pb-2 bg-black">
            <div className="text-sm text-gray-300 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 flex items-center justify-between gap-3">
              <span className="truncate">Selected file: {selectedFile.name}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  Remove
                </button>

                <button
                  onClick={uploadFile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  Analyze File
                </button>
              </div>
            </div>
          </div>
        )}

        {chart && (
          <div className="px-4 lg:px-5 pb-3 bg-black">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">
                Generated Dataset Chart
              </h3>

              <img
                src={`data:image/png;base64,${chart}`}
                alt="Generated Chart"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 p-4 lg:p-5 sticky bottom-0 bg-black">
          <div className="w-full flex items-end gap-3 bg-[#1f1f1f] border border-gray-700 rounded-3xl px-4 py-3">
            <label className="cursor-pointer text-gray-300 hover:text-white px-2 text-xl">
              📎
              <input
                type="file"
                accept=".txt,.csv,.xlsx,.pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();

                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                }
              }}
              placeholder="Ask Quant GPT anything..."
              rows={1}
              className="flex-1 w-full bg-transparent text-white placeholder:text-gray-400 outline-none resize-none px-2 py-2 min-h-[40px] max-h-[200px] overflow-y-auto"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
