import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { Clock, Calendar, ArrowRight, ArrowLeft, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

const POTDPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [todayProblem, setTodayProblem] = useState(null);
    const [prevProblems, setPrevProblems] = useState([]);
    const [timeLeft, setTimeLeft] = useState("");
    const [solvedProblemIds, setSolvedProblemIds] = useState([]);

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const todayRes = await axiosClient.get('/problem/potd');
                setTodayProblem(todayRes.data);
                const prevRes = await axiosClient.get('/problem/potd/previous');
                setPrevProblems(prevRes.data);
                if (user) {
                    const solvedRes = await axiosClient.get('/problem/problemSolvedByUser');
                    setSolvedProblemIds(solvedRes.data.map(p => p._id));
                }
            } catch (error) {
                console.error("Error fetching POTD data:", error);
            }
        };
        fetchData();
    }, [user]);

    const isSolved = (problemId) => solvedProblemIds.includes(problemId);

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 pb-20 selection:bg-indigo-100">
            
            {/* --- HERO SECTION --- */}
            <div className="bg-gradient-to-r from-zinc-900 to-indigo-800 text-white pt-6 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>

                <div className="max-w-[1000px] mx-auto relative z-10">
                    
                    {/* BACK NAVIGATION */}
                    <NavLink to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-10 group text-[12px] font-black uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Challenges
                    </NavLink>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-[12px] uppercase tracking-[0.25em] mb-4">
                                <Zap className="w-4 h-4 fill-current" /> Daily Challenge
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Problem of The Day</h1>
                            <p className="text-zinc-400 text-sm mt-3 font-medium max-w-md">Level up your skills with a new challenge every day and keep your streak alive.</p>
                        </div>
                        
                        {/* TIMER BADGE */}
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col items-center shadow-2xl">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> New Problem In
                            </span>
                            <div className="text-3xl font-mono font-black text-white tracking-widest">
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    {/* TODAY'S PROBLEM CARD */}
                    {todayProblem ? (
                        <div className="bg-white text-zinc-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white">
                            <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest text-zinc-400">
                                            <Calendar size={16} className="text-indigo-600" />
                                            {new Date(todayProblem.date).toDateString()}
                                        </div>
                                        <div className="h-4 w-px bg-zinc-200"></div>
                                        <span className={`text-[12px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                            todayProblem.problemId?.difficulty === 'easy' ? 'text-emerald-600 border-emerald-100 bg-emerald-50/50' :
                                            todayProblem.problemId?.difficulty === 'medium' ? 'text-amber-600 border-amber-100 bg-amber-50/50' : 'text-rose-600 border-rose-100 bg-rose-50/50'
                                        }`}>
                                            {todayProblem.problemId?.difficulty}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-3xl font-black mb-6 tracking-tighter leading-none">{todayProblem.problemId?.title}</h2>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {(todayProblem.problemId?.tags || 'Algorithm, Arrays').split(',').map((tag, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-500 text-[10px] rounded-xl font-black uppercase tracking-widest border border-zinc-100">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    {isSolved(todayProblem.problemId?._id) ? (
                                        <div className="w-full md:w-auto bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl flex items-center justify-center gap-3 border border-emerald-100 cursor-default">
                                            <ShieldCheck size={18} /> Problem Solved
                                        </div>
                                    ) : (
                                        <NavLink 
                                            to={`/problem/${todayProblem.problemId?._id}`}
                                            className="w-full md:w-auto bg-zinc-950 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            Start Solving
                                            <ArrowRight className="w-4 h-4" />
                                        </NavLink>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-20 text-center flex flex-col items-center">
                            <div className="w-10 h-10 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Today's Challenge...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- PREVIOUS PROBLEMS --- */}
            <div className="max-w-[1000px] mx-auto px-6 mt-12">
                <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                        <h3 className="font-black text-zinc-900 text-[12px] uppercase tracking-widest flex items-center gap-3">
                           <Clock className="text-zinc-400 w-4 h-4" /> Past Problems
                        </h3>
                    </div>

                    <div className="divide-y divide-zinc-50">
                        {prevProblems.length > 0 ? (
                            prevProblems.map((potd) => (
                                <div key={potd._id} className="p-8 hover:bg-zinc-50/50 transition-all flex flex-col sm:flex-row justify-between items-center gap-6 group">
                                    <div className="flex-1 w-full">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                            {new Date(potd.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <h4 className="text-xl font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                            {potd.problemId?.title}
                                        </h4>
                                        <div className="mt-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                                potd.problemId?.difficulty === 'easy' ? 'text-emerald-500 border-emerald-100 bg-emerald-50/50' :
                                                potd.problemId?.difficulty === 'medium' ? 'text-amber-500 border-amber-100 bg-amber-50/50' : 'text-rose-500 border-rose-100 bg-rose-50/50'
                                            }`}>
                                                {potd.problemId?.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-full sm:w-auto">
                                        {isSolved(potd.problemId?._id) ? (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                                                <CheckCircle className="w-3.5 h-3.5" /> Solved
                                            </div>
                                        ) : (
                                            <NavLink 
                                                to={`/problem/${potd.problemId?._id}`}
                                                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white border border-zinc-200 px-6 py-2.5 rounded-xl hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all text-center block"
                                            >
                                                Try Again
                                            </NavLink>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-zinc-200">
                                    <Clock className="text-zinc-300" size={24} />
                                </div>
                                <h4 className="text-zinc-900 font-bold text-sm">No History Found</h4>
                                <p className="text-[12px] font-black uppercase tracking-widest text-zinc-400 mt-2">Previous challenges will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    <span>AlgoArena 2.0</span>
                    <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
                    <span>Daily Updates Enabled</span>
                </div>
            </div>
        </div>
    );
};

export default POTDPage;