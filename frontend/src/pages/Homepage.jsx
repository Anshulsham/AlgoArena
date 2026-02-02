import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { 
  BookOpen, 
  CheckCircle, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Zap, 
  Target,
  FilterX
} from 'lucide-react';

const COMPANY_LIST = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Adobe', 'Uber'];

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCompanies, setModalCompanies] = useState([]);

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        const enrichedData = data.map(prob => {
             const shuffled = [...COMPANY_LIST].sort(() => 0.5 - Math.random());
             const count = Math.floor(Math.random() * 5) + 1; 
             return { ...prob, companies: shuffled.slice(0, count) };
        });
        setProblems(enrichedData);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const handleOpenCompanyModal = (e, companies) => {
    e.preventDefault();
    e.stopPropagation();
    setModalCompanies(companies);
    setIsModalOpen(true);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  const stats = {
    total: problems.length,
    easy: problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
    medium: problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
    hard: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Premium Navigation */}
      <nav className="border-b border-zinc-200 bg-white/70 backdrop-blur-xl sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-sm text-white shadow-lg group-hover:scale-105 transition-transform">
                AA
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900">AlgoArena</span>
            </NavLink>

            <div className="hidden md:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
                <NavLink to="/potd" className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 transition-all text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> POTD
                </NavLink>
                <NavLink to="/discuss" className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 transition-all text-xs font-bold uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Community
                </NavLink>
                <NavLink to="/guide" className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 transition-all text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Guide
                </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 hover:border-indigo-500 hover:shadow-sm transition-all">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors">
                        My Profile
                    </NavLink>
                    {user?.role === 'admin' && (
                      <NavLink to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors font-semibold">
                        Admin Dashboard
                      </NavLink>
                    )}
                    <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
                        Logout
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                    <Target className="w-4 h-4" /> Mastery
                </div>
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter mb-3">Problems</h1>
                <p className="text-zinc-500 text-base max-w-md font-medium leading-relaxed">
                    Hone your technical skills with curated challenges designed for top engineers.
                </p>
            </div>

            {/* Micro Stats Overlay */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="px-4 py-2 text-center border-r border-zinc-100">
                    <div className="text-sm font-black text-zinc-950">{stats.total}</div>
                    <div className="text-[15px] font-bold text-zinc-400 uppercase">Total</div>
                </div>
                <div className="px-4 py-2 text-center">
                    <div className="text-sm font-black text-emerald-500">{stats.easy}</div>
                    <div className="text-[15px] font-bold text-zinc-400 uppercase">Easy</div>
                </div>
                <div className="px-4 py-2 text-center">
                    <div className="text-sm font-black text-amber-500">{stats.medium}</div>
                    <div className="text-[15px] font-bold text-zinc-400 uppercase">Mid</div>
                </div>
                <div className="px-4 py-2 text-center">
                    <div className="text-sm font-black text-rose-500">{stats.hard}</div>
                    <div className="text-[15px] font-bold text-zinc-400 uppercase">Hard</div>
                </div>
            </div>
        </div>

        {/* Refined Filters Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <select 
                        value={filters.difficulty}
                        onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                        className="appearance-none bg-white border border-zinc-200 text-zinc-700 py-2 pl-4 pr-10 rounded-xl text-xs font-bold hover:border-zinc-300 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer outline-none"
                    >
                        <option value="all">Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filters.tag}
                        onChange={(e) => setFilters({...filters, tag: e.target.value})}
                        className="appearance-none bg-white border border-zinc-200 text-zinc-700 py-2 pl-4 pr-10 rounded-xl text-xs font-bold hover:border-zinc-300 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer outline-none"
                    >
                        <option value="all">Topic Tags</option>
                        <option value="array">Array</option>
                        <option value="linkedList">Linked List</option>
                        <option value="graph">Graph</option>
                        <option value="dp">DP</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="appearance-none bg-white border border-zinc-200 text-zinc-700 py-2 pl-4 pr-10 rounded-xl text-xs font-bold hover:border-zinc-300 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer outline-none"
                    >
                        <option value="all">Solution Status</option>
                        <option value="solved">Solved Only</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
                </div>
            </div>
            
            {(filters.status !== 'all' || filters.difficulty !== 'all' || filters.tag !== 'all') && (
                <button
                    onClick={() => setFilters({ status: 'all', difficulty: 'all', tag: 'all' })}
                    className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                    <FilterX className="w-3.5 h-3.5" /> Reset Filters
                </button>
            )}
        </div>

        {/* High-End Problems Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-zinc-100 bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em]">
                    <div className="col-span-1 text-center">Solved</div>
                    <div className="col-span-4">Challenge</div>
                    <div className="col-span-2">Difficulty</div>
                    <div className="col-span-2">Tags</div>
                    <div className="col-span-3">Top Companies</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-100">
                    {filteredProblems.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center border border-dashed border-zinc-200">
                                <FilterX className="w-6 h-6 text-zinc-300" />
                            </div>
                            <div className="text-zinc-500 text-sm font-semibold">No problems match your selection.</div>
                        </div>
                    ) : (
                        filteredProblems.map((problem, index) => {
                             const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                             const companyList = problem.companies || [];
                             const displayCompanies = companyList.length > 2 ? companyList.slice(0, 2) : companyList;
                             const remainingCount = companyList.length > 2 ? companyList.length - 2 : 0;

                             return (
                                <div key={problem._id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-zinc-50/80 transition-all group">
                                    {/* 1. Status Column */}
                                    <div className="col-span-1 flex justify-center">
                                        {isSolved ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-zinc-100"></div>
                                        )}
                                    </div>

                                    {/* 2. Title Column */}
                                    <div className="col-span-4">
                                        <NavLink to={`/problem/${problem._id}`} className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                            {problem.title}
                                        </NavLink>
                                    </div>

                                     {/* 3. Difficulty Column */}
                                     <div className="col-span-2">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-wider ${getDifficultyStyle(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>

                                    {/* 4. Tags Column */}
                                    <div className="col-span-2">
                                        {problem.tags && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200/50 uppercase">
                                                {problem.tags}
                                            </span>
                                        )}
                                    </div>

                                    {/* 5. Companies Column */}
                                    <div className="col-span-3 flex flex-wrap gap-2">
                                        {displayCompanies.map((comp, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-white text-zinc-600 text-[10px] rounded-lg font-bold border border-zinc-200 shadow-sm">
                                                {comp}
                                            </span>
                                        ))}
                                        {remainingCount > 0 && (
                                            <button 
                                                onClick={(e) => handleOpenCompanyModal(e, companyList)}
                                                className="px-2.5 py-1 bg-zinc-950 text-white text-[10px] rounded-lg font-bold shadow-lg hover:bg-zinc-800 transition-all"
                                            >
                                                +{remainingCount}
                                            </button>
                                        )}
                                    </div>
                                </div>
                             )
                        })
                    )}
                </div>
            </div>
        </div>
        
        {/* Modern Footer */}
        <div className="mt-20 py-12 border-t border-zinc-200 flex flex-col items-center gap-4">
            <div className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">Built for Performers</div>
             <div className="text-zinc-500 text-xs font-medium">
                &copy; {new Date().getFullYear()} AlgoArena &bull; Engineering Platform
             </div>
        </div>
      </main>

      {/* Modern Companies Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setIsModalOpen(false)}>
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"></div>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                             <Trophy className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Companies</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{modalCompanies.length} Recruiters</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                        &times;
                    </button>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-2 gap-3">
                        {modalCompanies.map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-white hover:border-indigo-300 hover:shadow-xl transition-all group cursor-default">
                                <span className="font-bold text-sm text-zinc-700">{comp}</span>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// Helper for Exact UI Difficulty Styling
const getDifficultyStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100/50';
    case 'hard': return 'text-rose-600 bg-rose-50 border-rose-100/50';
    default: return 'text-zinc-500 bg-zinc-50 border-zinc-200';
  }
};

export default Homepage;