"use client";

import { Code2, Briefcase, GraduationCap } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-purple-600 tracking-wide uppercase">About</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            About Dheeraj
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Education */}
          <div className="text-center p-8 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
            <p className="text-sm text-gray-600">B.Tech in CS & Business Systems</p>
            <p className="text-sm text-gray-500">MGIT, Hyderabad</p>
            <p className="text-sm text-purple-600 font-medium mt-1">CGPA: 8.39/10</p>
          </div>

          {/* Experience */}
          <div className="text-center p-8 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
            <p className="text-sm text-gray-600">React Native Developer Intern</p>
            <p className="text-sm text-gray-500">Nurdd (Aug–Dec 2025)</p>
            <p className="text-sm text-purple-600 font-medium mt-1">Production Mobile Apps</p>
          </div>

          {/* Skills */}
          <div className="text-center p-8 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Code2 size={28} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tech Stack</h3>
            <p className="text-sm text-gray-600">Python, TypeScript, React Native</p>
            <p className="text-sm text-gray-500">LangChain, RAG, Node.js</p>
            <p className="text-sm text-purple-600 font-medium mt-1">12 Public Repos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
