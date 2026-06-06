"use client";

import { MessageCircle, Phone, Calendar, Shield, Cpu, GitBranch } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "RAG-Powered Chat",
    description: "Ask anything about my resume, skills, or projects. Grounded in real data — no hallucinations.",
  },
  {
    icon: Phone,
    title: "Voice Agent",
    description: "Call my AI representative. Natural conversation with <2s latency. Handles interruptions gracefully.",
  },
  {
    icon: Calendar,
    title: "Real Calendar Booking",
    description: "Check availability and book interviews directly. Connected to my real Google Calendar via Cal.com.",
  },
  {
    icon: GitBranch,
    title: "GitHub Knowledge",
    description: "Knows my repos inside-out — tech stacks, design tradeoffs, architecture decisions, commit history.",
  },
  {
    icon: Shield,
    title: "Honest & Grounded",
    description: "Stays truthful under adversarial probing. Says \"I don't know\" when it doesn't. No prompt injection.",
  },
  {
    icon: Cpu,
    title: "Always Available",
    description: "24/7 availability. Instant responses. No scheduling conflicts for the initial conversation.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-purple-600 tracking-wide uppercase">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Key Capabilities
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Everything you need to evaluate my fit — powered by AI, grounded in reality.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <feature.icon size={24} className="text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
