"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    Search,
    Settings,
    LogOut,
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

const chartMockData = [
    { name: 'Mon', apps: 4 },
    { name: 'Tue', apps: 7 },
    { name: 'Wed', apps: 5 },
    { name: 'Thu', apps: 12 },
    { name: 'Fri', apps: 8 },
    { name: 'Sat', apps: 2 },
    { name: 'Sun', apps: 1 },
];

interface DashboardData {
    applications: any[];
    stats: {
        totalApplied: number;
        interviews: number;
        rejections: number;
        responseRate: number;
    } | null;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dashData, setDashData] = useState<DashboardData>({ applications: [], stats: null });

    const [userName, setUserName] = useState('Soulmad');

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user) {
                window.location.href = '/login';
                return;
            }
            if (user.name) setUserName(user.name);

            try {
                const res = await axios.get(`${API_URL}/user/dashboard?userId=${user.id}`);
                setDashData(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-[#0a0a0c] flex items-center justify-center text-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="text-slate-400 font-medium animate-pulse">Synchronizing Data...</p>
                </div>
            </div>
        );
    }

    const { applications, stats } = dashData;

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-slate-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111114] border-r border-slate-800 flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                        U
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Unrole.</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'resumes', icon: FileText, label: 'My Resumes' },
                        { id: 'applications', icon: Search, label: 'Applications' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors mt-auto">
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Welcome back, {userName}</h1>
                        <p className="text-slate-400 mt-1">Your automation is currently active and searching.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20">
                            New Search
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Applied', value: stats?.totalApplied || '0', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { label: 'Interviews', value: stats?.interviews || '0', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { label: 'Match Rate', value: stats?.responseRate ? `${stats.responseRate}%` : '0%', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                        { label: 'Rejections', value: stats?.rejections || '0', icon: Users, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    ].map((stat, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={stat.label}
                            className="bg-[#111114] border border-slate-800 p-6 rounded-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Metrics</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-[#111114] border border-slate-800 p-8 rounded-2xl h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-6">Application Frequency</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={chartMockData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111114', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#indigo-400' }}
                                />
                                <Area type="monotone" dataKey="apps" stroke="#6366f1" fillOpacity={1} fill="url(#colorApps)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#111114] border border-slate-800 p-8 rounded-2xl h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-6">Real-time Match Match Scoring</h3>
                        <div className="space-y-6">
                            {applications.length > 0 ? applications.slice(0, 4).map((app: any) => (
                                <div key={app.id} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="font-medium text-slate-300 truncate max-w-[200px]">{app.job.title} - {app.job.company}</span>
                                        <span className="text-indigo-400 font-bold">{Math.round(app.matchScore || 0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${app.matchScore || 0}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center text-slate-500 italic">
                                    No application data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Applications Table */}
                <section className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Recent Automation Flow</h3>
                        <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-800/20">
                                    <th className="px-6 py-4 text-slate-400 font-semibold text-sm">Role & Company</th>
                                    <th className="px-6 py-4 text-slate-400 font-semibold text-sm">Date</th>
                                    <th className="px-6 py-4 text-slate-400 font-semibold text-sm">Status</th>
                                    <th className="px-6 py-4 text-slate-400 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {applications.length > 0 ? applications.map((app: any) => (
                                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{app.job.title}</div>
                                            <div className="text-slate-500 text-sm">{app.job.company}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'APPLIED' ? 'bg-indigo-400/10 text-indigo-400' : 'bg-rose-400/10 text-rose-400'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-500 hover:text-white transition-colors">
                                                <AlertCircle size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                            The automation engine is searching for jobs matching your profile...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0c;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
        </div>
    );
}
