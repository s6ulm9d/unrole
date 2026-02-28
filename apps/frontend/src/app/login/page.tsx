"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Lock } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            router.push('/onboarding');
        } catch (err) {
            console.error(err);
            alert('Login failed: Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#111114] border border-slate-800 p-10 rounded-3xl shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                        U
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">Unrole.</span>
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
                <p className="text-slate-400 text-center mb-10 text-sm">Enter your email to access your automation dashboard.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full bg-black/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full bg-black/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? 'Authenticating...' : 'Continue'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
