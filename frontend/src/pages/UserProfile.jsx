import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import DeleteProfileModal from '../components/DeleteProfileModal';
import {
  CheckCircle, ArrowLeft, ChevronRight, Trophy, Zap,
  Activity, MapPin, Crown, MessageSquare, Eye, Calendar, Sparkles, Hash, Box
} from 'lucide-react';
import StreakCalendar from '../components/StreakCalendar';

function UserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileUser, setProfileUser] = useState(user);

  const [solvedProblems, setSolvedProblems] = useState([]);
  const [myDiscussions, setMyDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- CONFIGURATION ---
  const TOTAL_COUNTS = { total: 24, easy: 10, medium: 8, hard: 6 };
  const RANKS = ['Newbie', 'Junior', 'Intermediate', 'Specialist', 'Advanced', 'Goat'];
  const memberSince = "2026";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
          const [solvedRes, discussRes, userRes] = await Promise.all([
          axiosClient.get('/problem/problemSolvedByUser'),
          axiosClient.get('/discuss/all'),
          axiosClient.get('/user/me')
        ]);

        setSolvedProblems(solvedRes.data);
        setMyDiscussions(discussRes.data.filter(post =>
          (post.author?._id === user?._id) || (post.author === user?._id)
        ));
        setProfileUser(userRes.data);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleLogout = () => dispatch(logoutUser());

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // --- PROGRESS CALCULATIONS ---
  const stats = {
    totalSolved: solvedProblems.length,
    easySolved: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
    mediumSolved: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
    hardSolved: solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
  };

  const completionRate = Math.round((stats.totalSolved / TOTAL_COUNTS.total) * 100) || 0;
  const rankIndex = Math.min(Math.floor(stats.totalSolved / 4), RANKS.length - 1);
  const skillStats = solvedProblems.reduce((acc, p) => {
    if (p.tags) acc[p.tags] = (acc[p.tags] || 0) + 1;
    return acc;
  }, {});
  const topSkills = Object.entries(skillStats).sort(([, a], [, b]) => b - a).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-indigo-100">
      
      {/* Premium Navigation */}
      <nav className="border-b border-zinc-200 bg-white/70 backdrop-blur-xl sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:scale-105">AA</div>
                <span className="font-bold text-lg tracking-tight">AlgoArena <span className="text-zinc-400 font-medium ml-1">/ My Profile</span></span>
            </NavLink>
            <div className="flex items-center gap-6">
                <NavLink to="/" className="text-[12px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ArrowLeft size={16} /> Exit to Home
                </NavLink>
                <button onClick={handleLogout} className="text-[12px] font-black uppercase tracking-widest text-zinc-700 hover:text-zinc-900 transition-all">Sign Out</button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-[12px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-all px-3 py-1.5 hover:bg-rose-50 rounded-lg"
                >
                  Delete Account
                </button>
            </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* --- Left Column: Identity --- */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-3xl bg-zinc-950 flex items-center justify-center text-4xl font-black text-white shadow-2xl mb-6 border-4 border-white">
                            {user?.firstName?.[0]}
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter mb-1 capitalize text-zinc-900">{user?.firstName} {user?.lastName}</h2>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest mb-8">
                            <MapPin size={12} className="text-indigo-500" /> Platform Member
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <Crown className="text-amber-500" size={18} />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Skill Level</span>
                                </div>
                                <span className="font-black text-zinc-900 text-sm">{RANKS[rankIndex]}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-indigo-500" size={18} />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Member Since</span>
                                </div>
                                <span className="font-black text-zinc-900 text-sm">{memberSince}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Topics Mastery Card */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                        <Sparkles size={15} className="text-indigo-500" /> Top Skill Areas
                    </h3>
                    <div className="space-y-5">
                        {topSkills.length > 0 ? topSkills.map(([skill, count]) => (
                            <div key={skill} className="flex justify-between items-center group">
                                <span className="text-[12px] font-bold text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100 group-hover:border-indigo-200 transition-colors capitalize">{skill}</span>
                                <span className="font-black text-zinc-900 text-xs">{count} Solved</span>
                            </div>
                        )) : <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic text-center py-4">Solve problems to see skill stats</p>}
                    </div>
                </div>

                <StreakCalendar 
                    solvedDates={profileUser?.solvedPOTDDates || []} 
                    streakCount={profileUser?.streak?.current || 0} 
                />
            </div>

            {/* --- Right Column: Performance --- */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* Progress Overview Hero Card */}
                <div className="bg-white rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[120px] -mr-32 -mt-32 rounded-full" />
                    <div className="relative z-10">
                        <div className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Your Progress</div>
                        <h2 className="text-5xl font-black tracking-tighter mb-10">
                            {stats.totalSolved} <span className="text-zinc-800">Problems Solved</span>
                        </h2>
                        
                        <div className="grid grid-cols-3 gap-10">
                            {[
                                { label: 'Easy', value: stats.easySolved, total: TOTAL_COUNTS.easy, color: 'text-emerald-400' },
                                { label: 'Medium', value: stats.mediumSolved, total: TOTAL_COUNTS.medium, color: 'text-amber-400' },
                                { label: 'Hard', value: stats.hardSolved, total: TOTAL_COUNTS.hard, color: 'text-rose-400' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                                    <div className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value} <span className="text-zinc-700 text-xs font-bold">/ {stat.total}</span></div>
                                    <div className="h-1 w-full bg-zinc-300 rounded-full mt-3 overflow-hidden">
                                        <div className={`h-full bg-current ${stat.color}`} style={{ width: `${(stat.value / stat.total) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Overall Score Progress Bar */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Total Progress</h3>
                            <p className="text-xs text-zinc-400 font-medium">How much of the library you've completed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1 max-w-md">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-950 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                        </div>
                        <span className="font-black text-zinc-950 text-sm w-12 text-right">{completionRate}%</span>
                    </div>
                </div>

                {/* Solving History Table */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                            <Box className="text-indigo-600" size={20} /> Solving History
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50/50 text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-100">
                                <tr>
                                    <th className="px-8 py-4 w-20">Status</th>
                                    <th className="px-8 py-4">Problem Name</th>
                                    <th className="px-8 py-4">Difficulty</th>
                                    <th className="px-8 py-4 text-right">Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {solvedProblems.length > 0 ? solvedProblems.map(p => (
                                    <tr key={p._id} className="hover:bg-zinc-50/80 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                <CheckCircle size={14} className="text-emerald-500" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-zinc-900 text-sm tracking-tight">{p.title}</div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{p.tags || 'General'}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                                p.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-600 border-emerald-100 bg-emerald-50/50' : 
                                                p.difficulty?.toLowerCase() === 'medium' ? 'text-amber-600 border-amber-100 bg-amber-50/50' : 
                                                'text-rose-600 border-rose-100 bg-rose-50/50'
                                            }`}>
                                                {p.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <NavLink to={`/problem/${p._id}`} className="text-zinc-300 hover:text-indigo-600 transition-colors">
                                                <ChevronRight size={18} />
                                            </NavLink>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-16 text-center">
                                            <Hash size={32} className="text-zinc-100 mx-auto mb-3" />
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">You haven't solved any problems yet</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* My Discussions Section */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-zinc-100">
                        <h3 className="text-lg font-black tracking-tight flex items-center gap-3 text-zinc-900">
                            <MessageSquare className="text-indigo-600" size={20} /> My Discussions
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-50">
                        {myDiscussions.length > 0 ? myDiscussions.map(d => (
                            <NavLink key={d._id} to={`/discuss/${d._id}`} className="p-8 hover:bg-zinc-50/80 transition-all flex justify-between items-center group">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{d.category}</div>
                                    <h4 className="font-bold text-zinc-900 text-base tracking-tight truncate group-hover:text-indigo-600 transition-colors">{d.title}</h4>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Eye size={14} /> {d.views || 0} Views</span>
                                        <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {d.comments?.length || 0} Comments</span>
                                        <span>•</span>
                                        <span>{formatDate(d.createdAt)}</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-zinc-200 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </NavLink>
                        )) : (
                            <div className="p-16 text-center">
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">You haven't started any discussions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>

      <DeleteProfileModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default UserProfile;