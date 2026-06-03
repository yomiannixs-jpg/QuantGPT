"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "katex/dist/katex.min.css";

const modes = [
  "General AI Chat", "Research Assistant", "Education Engine", "SAT Practice",
  "ACT Practice", "GRE Practice", "GMAT Practice", "LSAT Practice", "MCAT Practice",
  "Olympiads", "AP Exams", "WAEC Practice", "JAMB Practice", "IGCSE Practice",
  "A-Level Practice", "Mathematics", "Pure Mathematics", "Applied Mathematics",
  "Statistics", "Finance", "Economics", "Actuarial Science", "Physics", "Chemistry", "Engineering",
  "Computer Science", "Data Science", "AI & Machine Learning", "Practice Questions",
  "File Analysis", "Stock Analysis"
];

type Message = { role: "user" | "assistant"; text: string };

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("General AI Chat");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Welcome to Quant AI. Ask anything in mathematics, finance, science, engineering, economics, data analysis, research, coding, exam prep, Olympiads, or stock analysis." }
  ]);
  useEffect(() => {
  const savedMessages = localStorage.getItem("quant-ai-messages");
  const savedMode = localStorage.getItem("quant-ai-mode");

  if (savedMessages) {
    setMessages(JSON.parse(savedMessages));
  }

  if (savedMode) {
    setMode(savedMode);
  }
}, []);

useEffect(() => {
  localStorage.setItem("quant-ai-messages", JSON.stringify(messages));
}, [messages]);

useEffect(() => {
  localStorage.setItem("quant-ai-mode", mode);
}, [mode]);

async function sendMessage() {
  if (!message.trim()) return;

  const currentMessage = message;

  setMessages((prev) => [
    ...prev,
    { role: "user", text: currentMessage },
    { role: "assistant", text: "" },
  ]);

  setMessage("");
  setLoading(true);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${apiUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: currentMessage,
        mode,
      }),
    });

    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        updated[lastIndex] = {
          ...updated[lastIndex],
          text: updated[lastIndex].text + chunk,
        };

        return updated;
      });
    }
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "Could not connect to backend. Check that FastAPI is running and NEXT_PUBLIC_API_URL is correct.",
      },
    ]);
  }

  setLoading(false);
}

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-gray-950 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-0">
          <div className="sm:w-1/3 lg:w-full">
            <h1 className="text-3xl font-bold mb-2">Quant AI</h1>
            <p className="text-gray-400 text-sm mb-4">One AI for learning, research, analysis and exam prep.</p>
          </div>

          <div className="sm:w-1/3 lg:w-full">
            <button
              onClick={() => {
  const freshMessages: Message[] = [
    { role: "assistant", text: "New chat started. Ask Quant AI anything." },
  ];

  setMessages(freshMessages);
  localStorage.setItem("quant-ai-messages", JSON.stringify(freshMessages));
}}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3 mb-4 font-semibold"
            >
              + New Chat
            </button>
          </div>

          <div className="sm:w-1/3 lg:w-full">
            <p className="text-gray-400 text-sm mb-2">Mode</p>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
            >
              {modes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="hidden lg:block space-y-3 text-sm text-gray-400 mt-6">
          <p>Core Engines:</p>
          <p>• AI Chat</p>
          <p>• Research Assistant</p>
          <p>• Math & Science Solver</p>
          <p>• Finance & Stock Analysis</p>
          <p>• Practice Question Generator</p>
          <p>• Education Engine</p>
          <p>• File Intelligence</p>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-h-[calc(100vh-230px)] lg:min-h-screen">
        <div className="border-b border-gray-800 p-4 lg:p-5">
          <h2 className="text-xl lg:text-2xl font-semibold">{mode}</h2>
          <p className="text-gray-400 text-xs lg:text-sm">Connected through NEXT_PUBLIC_API_URL</p>
        </div>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full lg:max-w-4xl p-4 rounded-2xl text-sm lg:text-base ${
                msg.role === "user" ? "bg-blue-700 lg:ml-auto" : "bg-gray-900 border border-gray-800"
              }`}
            >
              <p className="text-sm text-gray-300 mb-2">
                {msg.role === "user" ? "You" : "Quant AI"}
              </p>

              <div className="whitespace-pre-wrap leading-relaxed break-words">
               <ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
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
              <p className="text-sm text-gray-300 mb-2">Quant AI</p>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-4 lg:p-5 sticky bottom-0 bg-black">
  <div className="w-full flex items-end gap-3 bg-[#1f1f1f] border border-gray-700 rounded-3xl px-4 py-3">
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
  placeholder="Ask Quant AI anything..."
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
