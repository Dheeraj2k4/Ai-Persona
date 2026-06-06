"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Calendar, Loader2, Phone, Sparkles, BookOpen, Code } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage.content += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantMessage.content }
                : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const suggestions = [
    { icon: Sparkles, label: "Why are you right for this role?", color: "text-purple-600" },
    { icon: Code, label: "Tell me about your GitHub projects", color: "text-blue-600" },
    { icon: BookOpen, label: "Walk me through your resume", color: "text-emerald-600" },
    { icon: Calendar, label: "Book an interview", color: "text-orange-600" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#fafbff]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">AI Persona</h1>
        <div className="flex items-center gap-2">
          <a
            href="tel:+1XXXXXXXXXX"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Phone size={14} />
            Call Agent
          </a>
          <a
            href="https://cal.com/dheeraj-talapala-uzhigt/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
          >
            <Calendar size={14} />
            Book Interview
          </a>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty state — greeting + suggestions */
          <div className="flex flex-col items-center justify-center h-full px-6">
            {/* Gradient orb */}
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-300 via-purple-300 to-blue-300 opacity-60 blur-md absolute inset-0" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-400 shadow-2xl" />
            </div>

            {/* Greeting */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2">
              Hi, I&apos;m Dheeraj&apos;s AI
            </h2>
            <p className="text-lg text-gray-900 text-center">
              How Can I <span className="text-purple-600 font-semibold">Assist You Today?</span>
            </p>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
              Ask about my background, skills, projects, or book an interview. Grounded in real resume &amp; GitHub data.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-xl">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestion(s.label)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-left text-sm text-gray-700 hover:border-purple-300 hover:shadow-md hover:shadow-purple-50 transition-all group"
                >
                  <s.icon size={18} className={`${s.color} group-hover:scale-110 transition-transform`} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-purple-600 text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                  }`}
                >
                  {message.content || (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-md shadow-sm">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-6 pt-2">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100 focus-within:border-purple-300 focus-within:shadow-purple-100 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Initiate a query or send a command to the AI..."
              rows={1}
              className="w-full resize-none rounded-2xl px-5 py-4 pr-14 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            RAG-grounded over real resume &amp; GitHub repos • Powered by Llama 3.3 70B
          </p>
        </form>
      </div>
    </div>
  );
}
