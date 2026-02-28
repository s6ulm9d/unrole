"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, ArrowRight, CheckCircle2, Upload, File } from 'lucide-react';
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleResumeSubmit = async () => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user) {
            router.push('/login');
            return;
        }

        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        try {
            await axios.post(`${API_URL}/user/resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStep(2);
        } catch (err) {
            console.error(err);
            alert('Failed to process resume');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesSubmit = async () => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user) return;

        setLoading(true);
        try {
            await axios.post(`${API_URL}/user/preferences`, {
                userId: user.id,
                preferences: {
                    keywords: keywords.split(',').map(s => s.trim()),
                    locations: ['Remote'],
                    experienceLevel: ['Senior']
                }
            });
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-800'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-3">Upload your resume</h1>
                                <p className="text-slate-400">Upload your PDF resume. Our AI will automatically parse your skills.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-800 rounded-3xl cursor-pointer hover:border-indigo-500 bg-[#111114] transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {file ? (
                                            <>
                                                <File size={48} className="text-indigo-400 mb-4" />
                                                <p className="text-sm text-slate-300 font-medium">{file.name}</p>
                                                <p className="text-xs text-slate-500 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={48} className="text-slate-600 group-hover:text-indigo-400 transition-colors mb-4" />
                                                <p className="mb-2 text-sm text-slate-400 font-semibold leading-none">Click to upload</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">PDF Only</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                </label>

                                <button
                                    onClick={handleResumeSubmit}
                                    disabled={!file || loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing Resume...' : 'Analyze My Resume'}
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-3">What are you looking for?</h1>
                                <p className="text-slate-400">Set your job keywords so we know exactly what to target.</p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    className="w-full bg-[#111114] border border-slate-800 rounded-2xl p-6 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Senior Frontend Engineer, React, Node.js"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                />
                                <button
                                    onClick={handlePreferencesSubmit}
                                    disabled={!keywords || loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Saving...' : 'Start Job Discovery'}
                                    <CheckCircle2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
