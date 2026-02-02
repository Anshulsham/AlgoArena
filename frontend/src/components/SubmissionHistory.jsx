import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  CheckCircle, XCircle, Clock, ChevronRight, X, Cpu, 
  Database, AlertCircle, Terminal, History 
} from 'lucide-react';

const SubmissionHistory = ({ problemId, isDarkMode }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Endpoint remains the same, but the UI context is now "History"
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        if (response.data && Array.isArray(response.data)) {
            setSubmissions(response.data);
        } else {
            setSubmissions([]);
        }
        setError(null);
      } catch (err) {
        setError('Unable to load your submission history');
        console.error(err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [problemId]);

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className={`w-8 h-8 border-2 rounded-full animate-spin mb-4 ${isDarkMode ? 'border-zinc-800 border-t-indigo-500' : 'border-zinc-200 border-t-indigo-600'}`}></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Loading History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`m-4 p-4 rounded-2xl border flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
        <AlertCircle size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-24 animate-in fade-in duration-500">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-dashed ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <History className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className={`font-black text-sm uppercase tracking-widest mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-900'}`}>No Submissions Yet</h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Submit your solution to track your progress</p>
        </div>
      ) : (
        <div className="overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <th className="pb-4 pl-4">Result</th>
                <th className="pb-4">Language</th>
                <th className="pb-4">Runtime</th>
                <th className="pb-4">Date</th>
                <th className="pb-4 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const isAccepted = sub.status?.toLowerCase() === 'accepted';
                return (
                  <tr 
                    key={sub._id} 
                    className={`group cursor-pointer transition-all duration-200 ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100/50'}`}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <td className={`py-4 pl-4 rounded-l-2xl border-y border-l transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700' : 'bg-white border-zinc-200 group-hover:border-zinc-300'}`}>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                          isAccepted 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {isAccepted ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5" />}
                          {sub.status}
                        </span>
                      </div>
                    </td>
                    <td className={`py-4 border-y transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700' : 'bg-white border-zinc-200 group-hover:border-zinc-300'}`}>
                      <span className={`text-[12px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {sub.language}
                      </span>
                    </td>
                    <td className={`py-4 border-y transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700' : 'bg-white border-zinc-200 group-hover:border-zinc-300'}`}>
                      <span className="text-[12px] font-mono font-bold text-indigo-500">{sub.runtime}ms</span>
                    </td>
                    <td className={`py-4 border-y transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700' : 'bg-white border-zinc-200 group-hover:border-zinc-300'}`}>
                      <span className={`text-[12px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{formatDate(sub.createdAt)}</span>
                    </td>
                    <td className={`py-4 pr-4 rounded-r-2xl border-y border-r transition-colors text-right ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700' : 'bg-white border-zinc-200 group-hover:border-zinc-300'}`}>
                      <ChevronRight size={16} className={`transition-all group-hover:translate-x-1 ${isDarkMode ? 'text-zinc-700 group-hover:text-indigo-400' : 'text-zinc-300 group-hover:text-indigo-600'}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Code Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedSubmission(null)}
          ></div>
          
          <div className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300 border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-indigo-500/10' : 'bg-white border-zinc-200 shadow-zinc-400/20'}`}>
            {/* Modal Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-indigo-500 shadow-lg">
                    <Terminal size={20} />
                </div>
                <div>
                    <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>Submission Detail</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                          selectedSubmission.status?.toLowerCase() === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {selectedSubmission.status}
                        </span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">• {selectedSubmission.language}</span>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-200 shadow-sm'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Performance Stats */}
            <div className={`px-8 py-3 flex items-center gap-8 border-b ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <Clock size={15} className="mr-2 text-indigo-500" />
                Runtime: <span className={`ml-1 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{selectedSubmission.runtime}ms</span>
              </div>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <Database size={15} className="mr-2 text-indigo-500" />
                Memory: <span className={`ml-1 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{formatMemory(selectedSubmission.memory)}</span>
              </div>
              {selectedSubmission.testCasesPassed !== undefined && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <Cpu size={15} className="mr-2 text-indigo-500" />
                  Test Cases: <span className={`ml-1 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}</span>
                </div>
              )}
            </div>

            {/* Error Message Section */}
            {selectedSubmission.errorMessage && (
              <div className={`px-8 py-4 ${isDarkMode ? 'bg-rose-500/5 border-b border-rose-500/20' : 'bg-rose-50 border-b border-rose-100'}`}>
                <div className="flex gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <p className="text-[11px] text-rose-500 font-mono font-bold leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.errorMessage}
                    </p>
                </div>
              </div>
            )}

            {/* Code Editor Preview */}
            <div className={`flex-1 overflow-auto p-8 font-mono ${isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-700'}`}>
              <pre className="text-[13px] leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
            
            {/* Modal Footer */}
            <div className={`px-8 py-3 border-t text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-400'}`}>
                Verified Submission Integrity // Secure Output
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;