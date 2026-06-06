"use client";

import Link from "next/link";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-purple-50/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 mb-8">
          <span className="text-xs font-medium text-purple-600">New</span>
          <span className="text-xs text-gray-600">Personal AI Representative v1.0</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Meet Dheeraj&apos;s AI
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Representative
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Ask about my background, skills, and projects. Book an interview directly.
          No human in the loop — powered by RAG over my real resume and GitHub repos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 hover:shadow-purple-300"
          >
            <MessageCircle size={20} />
            Start Chatting
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="tel:+1XXXXXXXXXX"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-purple-200 text-gray-700 font-medium hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <Phone size={20} />
            Call AI Agent
          </a>
        </div>

        {/* Floating Chat Bubbles Visual */}
        <div className="relative max-w-lg mx-auto">
          {/* Center orb */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-20 animate-pulse-ring" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-30 animate-pulse" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-300">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>

          {/* Floating chat bubbles */}
          <div className="absolute -top-4 -left-8 animate-float">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-lg border border-purple-100 text-sm text-gray-700">
              Tell me about your experience
            </div>
          </div>

          <div className="absolute top-8 -right-12 animate-float-delay">
            <div className="bg-purple-600 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg text-sm text-white">
              I worked at Nurdd as a React Native dev...
            </div>
          </div>

          <div className="absolute bottom-8 -left-16 animate-float-delay">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-lg border border-purple-100 text-sm text-gray-700">
              Can you book an interview?
            </div>
          </div>

          <div className="absolute -bottom-4 -right-8 animate-float">
            <div className="bg-purple-600 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg text-sm text-white">
              Done! Booked for Thursday 3 PM ✓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
