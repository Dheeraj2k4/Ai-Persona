"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Dheeraj AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium">
            Home
          </Link>
          <Link href="/chat" className="px-4 py-2 rounded-full text-gray-600 hover:text-purple-600 text-sm font-medium transition-colors">
            Chat
          </Link>
          <Link href="#features" className="px-4 py-2 rounded-full text-gray-600 hover:text-purple-600 text-sm font-medium transition-colors">
            Features
          </Link>
          <Link href="#about" className="px-4 py-2 rounded-full text-gray-600 hover:text-purple-600 text-sm font-medium transition-colors">
            About
          </Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/chat"
            className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Start Chat →
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 px-6 py-4 space-y-3">
          <Link href="/" className="block py-2 text-purple-600 font-medium">Home</Link>
          <Link href="/chat" className="block py-2 text-gray-600">Chat</Link>
          <Link href="#features" className="block py-2 text-gray-600">Features</Link>
          <Link href="#about" className="block py-2 text-gray-600">About</Link>
          <Link
            href="/chat"
            className="block w-full text-center px-5 py-2.5 rounded-full bg-purple-600 text-white font-medium"
          >
            Start Chat →
          </Link>
        </div>
      )}
    </nav>
  );
}
