import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { 
  BookOpen, Code, Trophy, User, ArrowLeft, Shield, 
  CheckCircle, Search, Play, FileText, Video, 
  MessageSquare, LayoutDashboard, PlusCircle, Trash2, UploadCloud,
  ChevronRight, Sparkles, Activity
} from 'lucide-react';

const GuidePage = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Premium Navbar */}
      <nav className="border-b border-zinc-200 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-sm text-white shadow-lg">
              AA
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900">AlgoArena Guide</span>
          </div>
          <NavLink to="/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-600 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit to Home
          </NavLink>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-zinc-200 py-16 text-center">
        <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-4 h-4" /> Resources
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mb-6">How it Works</h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Everything you need to know about solving problems, tracking your progress, and using our platform tools.
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-20 space-y-24">

        {/* ================= STUDENT GUIDE ================= */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-12 pb-6 border-b border-zinc-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Student Handbook</h2>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Mastering the Platform</p>
                </div>
            </div>

            <div className="grid gap-16">
                
                {/* 1. HOMEPAGE */}
                <section className="flex flex-col md:flex-row gap-12">
                    <div className="md:w-1/3">
                        <div className="flex items-center gap-2 mb-3">
                            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-xl font-black text-zinc-950 tracking-tight">The Problem List</h3>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                            Your main hub for discovering new challenges. We've designed the list to help you focus on the right problems at the right time.
                        </p>
                    </div>
                    <div className="md:w-2/3 bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
                        <div>
                            <h4 className="font-bold text-zinc-900 mb-3 flex items-center gap-2 text-sm">
                                <Search className="w-4 h-4 text-indigo-500" /> Smart Searching
                            </h4>
                            <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                    <span><strong>Quick Filters:</strong> Sort by Difficulty (Easy to Hard), specific Topic Tags, or see only problems you haven't solved yet.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                    <span><strong>Search:</strong> Use the search bar to find a specific problem name or keyword instantly.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 2. PROBLEM SOLVING PAGE */}
                <section className="flex flex-col md:flex-row gap-12">
                    <div className="md:w-1/3">
                        <div className="flex items-center gap-2 mb-3">
                            <Code className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-xl font-black text-zinc-950 tracking-tight">Code Editor</h3>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                            Our workspace is built for focus. Read the requirements on the left and write your solution on the right.
                        </p>
                    </div>
                    <div className="md:w-2/3 bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-8">
                        
                        <div>
                            <h4 className="font-bold text-zinc-900 mb-3 text-xs uppercase tracking-widest">Environment Features</h4>
                            <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                                <li className="flex gap-4">
                                    <span className="font-bold text-zinc-900 min-w-[100px]">Languages:</span>
                                    <span>Solve problems in JavaScript, Java, or C++ with pre-filled templates.</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="font-bold text-zinc-900 min-w-[100px]">Tools:</span>
                                    <span>Enjoy dark mode, syntax highlighting, and auto-formatting as you type.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs uppercase tracking-widest mb-3">
                                    <Play className="w-4 h-4 text-zinc-500" /> Run Code
                                </div>
                                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Tests your logic against sample data. Great for quick debugging.</p>
                            </div>
                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs uppercase tracking-widest mb-3">
                                    <CheckCircle className="w-4 h-4" /> Submit
                                </div>
                                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">Runs your code against all hidden tests to see if you passed.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        {/* ================= ADMIN GUIDE ================= */}
        {isAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-4 mb-12 pb-6 border-b border-rose-100 mt-16">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Admin Guide</h2>
                        <p className="text-sm font-bold text-rose-400 uppercase tracking-widest">Managing the Platform</p>
                    </div>
                </div>

                <div className="grid gap-12">
                    
                    <section className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h3 className="text-xl font-black mb-2 flex items-center gap-2 text-zinc-950">
                                <PlusCircle className="w-5 h-5 text-rose-500" /> Creating Content
                            </h3>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                Add new problems to the site in just a few minutes.
                            </p>
                        </div>
                        <div className="md:w-2/3 bg-rose-50/20 p-8 rounded-[2rem] border border-rose-100/50 space-y-4">
                            <ul className="space-y-3 text-sm text-zinc-600 font-medium">
                                <li className="flex gap-2">
                                    <span className="font-bold text-rose-600">•</span>
                                    <span><strong>Basic Info:</strong> Set the title, tags, difficulty, and problem description.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-rose-600">•</span>
                                    <span><strong>Test Cases:</strong> Define the inputs and expected outputs to grade user code.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-zinc-900 p-8 rounded-[2rem] shadow-2xl border border-zinc-800">
                            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                                <Trash2 className="w-5 h-5 text-rose-500" /> Delete Problems
                            </h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">
                                Use the management tool to permanently remove outdated problems from the site.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-zinc-950">
                                <UploadCloud className="w-5 h-5 text-indigo-500" /> Upload Tutorials
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-4">
                                Easily attach video walkthroughs to any existing problem.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        )}

      </div>

      {/* Footer CTA */}
      <div className="bg-zinc-950 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <h2 className="text-3xl font-black tracking-tighter mb-8 relative z-10">Ready to start coding?</h2>
        <NavLink to="/" className="relative z-10 inline-flex items-center gap-2 bg-white text-zinc-950 px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl hover:shadow-indigo-500/20 group">
            Browse Challenges <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NavLink>
      </div>
    </div>
  );
};

export default GuidePage;