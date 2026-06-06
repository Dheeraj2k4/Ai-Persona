"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Dheeraj's AI representative. I can tell you about his background, skills, projects, and experience — or help you book an interview. What would you like to know?",
    },
  ]);
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

  const suggestedQuestions = [
    "Tell me about your experience at Nurdd",
    "What's your Immigration Helper project about?",
    "Why are you the right fit for an AI Engineer role?",
    "Can I book an interview with you?",
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Dheeraj AI</h1>
            <p className="text-xs text-green-600">● Online</p>
          </div>
        </div>
        <div className="ml-auto">
          <a
            href="https://cal.com/dheeraj-talapala-uzhigt/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            <Calendar size={16} />
            Book Interview
          </a>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-white border border-purple-100 text-gray-700 rounded-bl-sm shadow-sm"
                }`}
              >
                {message.content || (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={14} className="animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Suggested questions (show only if 1 message) */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left px-4 py-3 rounded-xl border border-purple-200 bg-white text-sm text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-purple-100 bg-white/80 backdrop-blur-md px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Dheeraj's experience, skills, or projects..."
              rows={1}
              className="w-full resize-none rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-gray-400"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          RAG-grounded over real resume & GitHub repos. May occasionally make mistakes.
        </p>
      </div>
    </div>
  );
}
