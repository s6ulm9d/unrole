"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Shield, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">U</div>
          <span className="text-xl font-bold tracking-tight">Unrole.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <Link
          href="/login"
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-all"
        >
          Launch App
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-sm font-semibold"
          >
            <Zap size={14} />
            <span>AI-Powered LinkedIn Automation is here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter"
          >
            Apply to 100s of jobs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              while you sleep.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Unrole uses advanced AI to parse your resume, find matching jobs on LinkedIn,
            and automate the application process with human-like precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link
              href="/login"
              className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-600/20"
            >
              Get Started for Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          {[
            {
              title: "Hyper-Personalization",
              desc: "GPT-4o tailors every single bullet point to match the job description perfectly.",
              icon: Rocket
            },
            {
              title: "Stealth Automation",
              desc: "Human-like browser behavior with randomized delays and cursor jitter.",
              icon: Shield
            },
            {
              title: "Real-time Analytics",
              desc: "Track every interview, rejection, and match score from a premium dashboard.",
              icon: Zap
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111114] border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-900 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Unrole Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
