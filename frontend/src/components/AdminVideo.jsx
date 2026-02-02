import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink, useNavigate } from 'react-router';
import { 
  Video, Trash2, ArrowLeft, Search, AlertCircle, 
  UploadCloud, ChevronRight, Hash, Filter, Clapperboard
} from 'lucide-react';

const AdminVideo = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('System failure: Unable to retrieve problem assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Decommission video asset for this challenge?')) return;
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      alert("Asset purged successfully.");
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to purge asset';
      alert(errorMessage);
    }
  };

  const filteredProblems = problems.filter(problem => 
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-indigo-100">
      
      {/* Premium Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-zinc-950 rounded-lg text-white flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform">
                AA
              </div>
              <span className="font-black text-lg tracking-tight text-zinc-950">AlgoArena</span>
            </NavLink>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="text-[12px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 flex items-center gap-2 transition-all group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Admin Console
          </button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* Header Architecture */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-zinc-100">
            <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-3">
                    <Clapperboard size={15} /> Manage Media
                </div>
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Video Management</h1>
                <p className="text-zinc-500 text-sm mt-2 font-medium">Create and publish expert editorials for the problem library.</p>
            </div>

            {/* Tactical Search Field */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Filter by challenge title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 w-full md:w-80 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* Content Logic */}
        {loading ? (
           <div className="flex flex-col justify-center items-center py-32 text-zinc-400 gap-4">
             <div className="w-10 h-10 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Syncing Asset Registry</span>
           </div>
        ) : error ? (
            <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-center gap-4 text-rose-700 animate-in fade-in zoom-in-95">
                <AlertCircle size={24} />
                <span className="text-sm font-bold uppercase tracking-wide">{error}</span>
            </div>
        ) : (
            <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400">
                                <th className="px-8 py-5 w-20 text-center">PID</th>
                                <th className="px-8 py-5">Problem Title</th>
                                <th className="px-8 py-5 w-32">Difficulty</th>
                                <th className="px-8 py-5 w-48">Problem Categories</th>
                                <th className="px-8 py-5 text-right">Publishing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredProblems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <Hash size={40} className="mx-auto mb-4 text-zinc-100" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No registry entries match your query</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProblems.map((problem, index) => (
                                    <tr key={problem._id} className="hover:bg-zinc-50/80 transition-all group">
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-mono font-bold text-zinc-300">
                                                {String(index + 1).padStart(3, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-zinc-950 tracking-tight text-base group-hover:text-indigo-600 transition-colors">
                                                {problem.title}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getDifficultyStyle(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(problem.tags || 'General').split(',').slice(0, 1).map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-zinc-200">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end items-center gap-3">
                                                <NavLink 
                                                    to={`/admin/upload/${problem._id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100/50 shadow-sm active:scale-95"
                                                >
                                                    <UploadCloud size={14} /> Upload
                                                </NavLink>
                                                
                                                <button 
                                                    onClick={() => handleDelete(problem._id)}
                                                    className="inline-flex items-center justify-center w-10 h-10 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-95"
                                                    title="Purge Video Asset"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Technical Footer */}
        <footer className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                <Clapperboard size={12} /> Library Build 2.0.4
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} AlgoArena Engine &bull; Media Manager
            </p>
        </footer>
      </main>
    </div>
  );
};

// Standardized Theme Style Helper
const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-600 border-emerald-100 bg-emerald-50/50';
      case 'medium': return 'text-amber-600 border-amber-100 bg-amber-50/50';
      case 'hard': return 'text-rose-600 border-rose-100 bg-rose-50/50';
      default: return 'text-zinc-500 border-zinc-200 bg-zinc-100';
    }
};

export default AdminVideo;