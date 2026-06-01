"use client";

import { useState } from "react";

const modes = [
  "General AI Chat", "Research Assistant", "Education Engine", "SAT Practice",
  "ACT Practice", "GRE Practice", "GMAT Practice", "LSAT Practice", "MCAT Practice",
  "Olympiads", "AP Exams", "WAEC Practice", "JAMB Practice", "IGCSE Practice",
  "A-Level Practice", "Mathematics", "Pure Mathematics", "Applied Mathematics",
  "Statistics", "Finance", "Economics", "Physics", "Chemistry", "Engineering",
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

  async function sendMessage() {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessages((prev) => [...prev, { role: "user", text: currentMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage, mode }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: data.response || data.error || "Backend responded, but no message was returned.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "Could not connect to backend. Check that FastAPI is running and NEXT_PUBLIC_API_URL is correct.",
      }]);
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
              onClick={() => setMessages([{ role: "assistant", text: "New chat started. Ask Quant AI anything." }])}
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
              <p className="text-sm text-gray-300 mb-2">{msg.role === "user" ? "You" : "Quant AI"}</p>
              <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
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
          <div className="flex flex-col lg:flex-row gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Quant AI anything..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white min-h-[90px]"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-2xl px-8 py-4 font-semibold"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
