import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router'; 
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { 
  Play, Send, Code, FileText, BookOpen, MessageSquare, 
  History, ChevronDown, CheckCircle, XCircle, Sun, Moon, 
  Clock, Cpu, Tag, ChevronLeft, Layout, Sparkles 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { runCode, submitCode } from '../submissionSlice';

const langMap = { cpp: 'C++', java: 'Java', javascript: 'JavaScript' };

const ProblemPage = () => {
  const dispatch = useDispatch();
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  
  // Default to Dark Mode for a professional IDE experience
  const [isDarkMode, setIsDarkMode] = useState(true); 

  // Resizable State
  const [leftWidth, setLeftWidth] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  let { problemId } = useParams();

  // Fetch Problem Details
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        if (response.data && response.data.startCode) {
            const initialCodeObj = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]);
            setCode(initialCodeObj ? initialCodeObj.initialCode : '// No starter code available');
        }
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
      setLoading(false);
    };
    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem && problem.startCode) {
      const initialCodeObj = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]);
      if (initialCodeObj) setCode(initialCodeObj.initialCode);
    }
  }, [selectedLanguage, problem]);

  // Resizing Logic
  const startResizing = (e) => { e.preventDefault(); setIsDragging(true); };
  const stopResizing = () => setIsDragging(false);
  const resize = (e) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth > 25 && newWidth < 75) setLeftWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isDragging]);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const result = await dispatch(runCode({ problemId, code, language: selectedLanguage })).unwrap();
      setRunResult(result);
      setActiveRightTab('testcase');
      toast.success("Execution Complete");
    } catch (errorMessage) {
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const result = await dispatch(submitCode({ problemId, code, language: selectedLanguage })).unwrap();
      setSubmitResult(result);
      setActiveRightTab('result');
      result.accepted ? toast.success("Accepted! 🎉") : toast.error("Rejected");
    } catch (errorMessage) {
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const getDiffStyle = (diff) => {
    switch (diff?.toLowerCase()) {
        case 'easy': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
        case 'medium': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
        case 'hard': return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
        default: return 'text-zinc-500 border-zinc-700';
    }
  };

  if (loading && !problem) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-50 text-zinc-900'} ${isDragging ? 'select-none cursor-col-resize' : ''}`}>
      <Toaster position="bottom-right" />

      {/* --- Minimalist Workspace Header --- */}
      <header className={`h-12 border-b flex items-center justify-between px-4 shrink-0 z-50 ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
        <div className="flex items-center gap-4">
            <NavLink to="/" className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'}`}>
                <ChevronLeft size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">AA</div>
                <span className="text-[15px] font-bold tracking-tight">AlgoArena <span className="text-zinc-500 font-medium ml-1">/ Workspace</span></span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-zinc-800 text-amber-400' : 'hover:bg-zinc-100 text-zinc-600'}`}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* --- Left Panel: Context & Data --- */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${leftWidth}%` }}>
            <div className={`flex px-2 border-b h-10 items-center gap-1 shrink-0 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                {[
                    { id: 'description', label: 'Problem', icon: FileText },
                    { id: 'editorial', label: 'Editorial', icon: BookOpen },
                    { id: 'submissions', label: 'History', icon: History },
                    { id: 'chatAI', label: 'AI Assistant', icon: Sparkles }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveLeftTab(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeLeftTab === tab.id 
                            ? (isDarkMode ? 'bg-zinc-800 text-white shadow-inner' : 'bg-white text-indigo-600 shadow-sm border border-zinc-200') 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <tab.icon size={14} className={activeLeftTab === tab.id ? 'text-indigo-400' : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeLeftTab === 'description' && (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-2xl font-black tracking-tighter mb-4">{problem?.title}</h1>
                        <div className="flex items-center gap-3 mb-8">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getDiffStyle(problem?.difficulty)}`}>
                                {problem?.difficulty}
                            </span>
                            <div className="h-4 w-px bg-zinc-800"></div>
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <Tag size={14} className="text-indigo-500" /> {problem?.tags}
                            </span>
                        </div>

                        <div className={`prose prose-sm max-w-none leading-relaxed mb-10 text-[15px] font-medium ${isDarkMode ? 'prose-invert text-zinc-400' : 'text-zinc-600'}`}>
                            {problem?.description}
                        </div>

                        {/* Examples Architecture */}
                        <div className="space-y-6">
                            {problem?.visibleTestCases.map((tc, i) => (
                                <div key={i} className={`rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 shadow-sm'}`}>
                                    <div className={`px-4 py-2 border-b text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                        Example {i + 1}
                                    </div>
                                    <div className="p-4 space-y-4 font-mono text-[13px]">
                                        <div>
                                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Input</div>
                                            <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-100 text-zinc-800'}`}>{tc.input}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Output</div>
                                            <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-100 text-zinc-800'}`}>{tc.output}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`mt-10 pt-6 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                            <div className="flex gap-6 mb-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    <Clock size={14} className="text-indigo-500" /> 1.0s
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    <Cpu size={14} className="text-indigo-500" /> 256MB
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeLeftTab === 'editorial' && <Editorial secureUrl={problem.secureUrl} isDarkMode={isDarkMode} />}
                {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} isDarkMode={isDarkMode} />}
                {activeLeftTab === 'chatAI' && <ChatAi problem={problem} isDarkMode={isDarkMode} />}
            </div>
        </div>

        {/* --- Tactical Resizer --- */}
        <div 
            onMouseDown={startResizing} 
            className={`w-1 cursor-col-resize transition-all hover:bg-indigo-500/40 relative z-40 ${isDragging ? 'bg-indigo-600 scale-x-150' : 'bg-transparent'}`}
        />

        {/* --- Right Panel: Editor & Results --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`flex items-center justify-between px-4 h-10 border-b shrink-0 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                <div className="flex gap-1 h-full items-center">
                    {['code', 'testcase', 'result'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveRightTab(tab)} 
                            className={`px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${
                                activeRightTab === tab 
                                ? (isDarkMode ? 'bg-zinc-800 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm border border-zinc-200') 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="relative">
                    <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)} 
                        className="bg-zinc-700 border-2 text-[14px] font-black text-zinc-400 outline-none uppercase tracking-widest cursor-pointer appearance-none pr-4 rounded-md px-1"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
                {activeRightTab === 'code' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-1">
                            <Editor 
                                height="100%" 
                                theme={isDarkMode ? "vs-dark" : "light"}
                                language={selectedLanguage} 
                                value={code} 
                                onChange={setCode} 
                                options={{ 
                                    fontSize: 14, 
                                    fontFamily: 'JetBrains Mono, Menlo, monospace', 
                                    minimap: { enabled: false }, 
                                    padding: { top: 20 },
                                    scrollBeyondLastLine: false,
                                    renderLineHighlight: 'all',
                                    lineNumbersMinChars: 3
                                }} 
                            />
                        </div>
                        <div className={`p-4 border-t flex justify-end gap-3 shrink-0 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                            <button 
                                onClick={handleRun} 
                                disabled={loading} 
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                                    isDarkMode 
                                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' 
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'
                                }`}
                            >
                                <Play size={14} fill="currentColor" /> {loading ? 'Processing' : 'Run'}
                            </button>
                            <button 
                                onClick={handleSubmitCode} 
                                disabled={loading} 
                                className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95"
                            >
                                <Send size={14} fill="currentColor" /> {loading ? 'Uploading' : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}

                {activeRightTab !== 'code' && (
                    <div className={`p-8 h-full overflow-y-auto animate-in slide-in-from-right-4 duration-500 ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/50">
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                {activeRightTab === 'testcase' ? <><Play className="text-indigo-500" /> Test Logs</> : <><CheckCircle className="text-emerald-500" /> Deployment Verdict</>}
                            </h2>
                            <button onClick={() => setActiveRightTab('code')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-500 transition-colors">Return to Source</button>
                        </div>

                        {activeRightTab === 'testcase' && (
                             runResult ? (
                                <div className="space-y-6">
                                   <div className={`p-6 rounded-[2rem] border ${runResult.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                                       <div className="text-sm font-black uppercase tracking-widest mb-1">{runResult.success ? 'Accepted' : 'Wrong Answer'}</div>
                                       <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Runtime execution: {runResult.runtime}s</div>
                                   </div>
                                   
                                   <div className="grid gap-4">
                                       {runResult.testCases?.map((tc, idx) => (
                                           <div key={idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                                               <div className="flex justify-between mb-4">
                                                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Case {idx + 1}</span>
                                                   <span className={`text-[10px] font-black uppercase tracking-widest ${tc.status_id === 3 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                       {tc.status_id === 3 ? 'Success' : 'Fault'}
                                                   </span>
                                               </div>
                                               <div className="grid grid-cols-2 gap-6 font-mono text-xs">
                                                   <div>
                                                       <div className="text-[9px] font-bold text-zinc-500 uppercase mb-2">Expected</div>
                                                       <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">{tc.expected_output}</div>
                                                   </div>
                                                   <div>
                                                       <div className="text-[9px] font-bold text-zinc-500 uppercase mb-2">Actual</div>
                                                       <div className={`p-2 bg-zinc-950 rounded-lg border ${tc.status_id === 3 ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}>{tc.stdout || 'NULL'}</div>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                                </div>
                             ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-50">
                                    <Layout size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Execution Data Available</p>
                                </div>
                             )
                        )}

                        {activeRightTab === 'result' && (
                             submitResult ? (
                                <div className="text-center py-20 animate-in zoom-in duration-300">
                                   {submitResult.accepted ? (
                                       <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 mb-8 shadow-2xl shadow-emerald-500/20">
                                           <CheckCircle size={48} />
                                       </div>
                                   ) : (
                                       <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-8 shadow-2xl shadow-rose-500/20">
                                           <XCircle size={48} />
                                       </div>
                                   )}
                                   <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">{submitResult.accepted ? 'Accepted' : 'Submission Rejected'}</h2>
                                   <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">{submitResult.accepted ? 'Task verification successful' : (submitResult.error || 'Logical discrepancies detected')}</p>
                                   
                                   <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-12">
                                       {[
                                           { l: 'Passed', v: `${submitResult.passedTestCases}/${submitResult.totalTestCases}` },
                                           { l: 'Time', v: `${submitResult.runtime}s` },
                                           { l: 'Memory', v: `${Math.round(submitResult.memory/1024)}MB` }
                                       ].map((stat, i) => (
                                           <div key={i} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                                               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.l}</div>
                                               <div className="text-sm font-black text-white">{stat.v}</div>
                                           </div>
                                       ))}
                                   </div>
                                </div>
                             ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-50">
                                    <Send size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Solution Submission</p>
                                </div>
                             )
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;