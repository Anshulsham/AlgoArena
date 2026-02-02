import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { 
  MessageSquare, ArrowBigUp, ArrowBigDown, Plus, 
  Search, Clock, X, BookOpen, ArrowLeft, ChevronRight,
  TrendingUp, Eye
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'For You' },
  { id: 'interview', label: 'Interview' },
  { id: 'career', label: 'Career' },
  { id: 'contest', label: 'Contest' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'general', label: 'General' }
];

function DiscussionList() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [activeCategory]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/discuss/all');
      const filtered = activeCategory === 'all' 
        ? data 
        : data.filter(d => d.category === activeCategory);
      setDiscussions(filtered);
    } catch (error) {
      console.error("Failed to fetch discussions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, type) => {
    try {
      setDiscussions(prev => prev.map(d => {
        if (d._id === id) {
           const userId = user._id;
           let newUpvotes = [...d.upvotes];
           let newDownvotes = [...d.downvotes];
           
           if (type === 'up') {
              if (newUpvotes.includes(userId)) newUpvotes = newUpvotes.filter(uid => uid !== userId);
              else {
                newUpvotes.push(userId);
                newDownvotes = newDownvotes.filter(uid => uid !== userId);
              }
           } else {
              if (newDownvotes.includes(userId)) newDownvotes = newDownvotes.filter(uid => uid !== userId);
              else {
                newDownvotes.push(userId);
                newUpvotes = newUpvotes.filter(uid => uid !== userId);
              }
           }
           return { ...d, upvotes: newUpvotes, downvotes: newDownvotes };
        }
        return d;
      }));
      await axiosClient.put(`/discuss/vote/${id}`, { voteType: type });
    } catch (error) {
      fetchDiscussions();
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosClient.post('/discuss/create', newPost);
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', category: 'general' });
      fetchDiscussions();
    } catch (error) {
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => dispatch(logoutUser());

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    return "now";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900">
      
      {/* Professional Navbar */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1100px] w-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-zinc-950 rounded-lg text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform">AA</div>
              <span className="font-bold text-lg tracking-tight">AlgoArena</span>
            </NavLink>
            <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/discuss" className="px-3 py-1.5 rounded-md text-sm font-semibold bg-zinc-100 text-zinc-900">Community</NavLink>
                <NavLink to="/guide" className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all">Guide</NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <NavLink to="/" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back Home
            </NavLink>

            <div className="relative group">
                <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 hover:border-zinc-400 transition-all cursor-pointer">
                    {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50">Logout</button>
                </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        
        {/* Simple Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-950 mb-2">Community Feed</h1>
                <p className="text-zinc-500 font-medium">Discuss interview patterns, career growth, and technical challenges.</p>
            </div>
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
                <Plus className="w-4 h-4" /> New Discussion
            </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 border-b border-zinc-100 mb-8">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        activeCategory === cat.id 
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-md' 
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* List Section */}
        <div className="space-y-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-8 h-8 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Feed</span>
                </div>
            ) : discussions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-zinc-200">
                    <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <h3 className="text-zinc-950 text-lg font-bold tracking-tight">No discussions here yet</h3>
                    <p className="text-zinc-500 text-sm mb-6">Start a conversation to get the community involved.</p>
                    <button onClick={() => setIsCreateOpen(true)} className="text-indigo-600 font-bold hover:underline">Create first post</button>
                </div>
            ) : (
                discussions.map((post) => {
                    const voteCount = post.upvotes.length - post.downvotes.length;
                    const isUpvoted = post.upvotes.includes(user?._id);
                    const isDownvoted = post.downvotes.includes(user?._id);

                    return (
                        <div key={post._id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-zinc-200/40 flex gap-5 group">
                            
                            {/* Pro-Minimalist Vote Sidebar */}
                            <div className="flex flex-col items-center gap-1 bg-zinc-50/50 p-1.5 rounded-xl border border-zinc-100 min-w-[48px] h-fit">
                                <button onClick={() => handleVote(post._id, 'up')} className={`p-1.5 rounded-lg transition-all ${isUpvoted ? 'text-indigo-600 bg-white shadow-sm' : 'text-zinc-400 hover:bg-white'}`}>
                                    <ArrowBigUp className={`w-7 h-7 ${isUpvoted ? 'fill-current' : ''}`} />
                                </button>
                                <span className={`text-sm font-black ${isUpvoted ? 'text-indigo-600' : isDownvoted ? 'text-rose-500' : 'text-zinc-900'}`}>{voteCount}</span>
                                <button onClick={() => handleVote(post._id, 'down')} className={`p-1.5 rounded-lg transition-all ${isDownvoted ? 'text-rose-600 bg-white shadow-sm' : 'text-zinc-400 hover:bg-white'}`}>
                                    <ArrowBigDown className={`w-7 h-7 ${isDownvoted ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
                                        {post.author?.firstName?.[0]}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <span className="text-zinc-900">{post.author?.firstName} {post.author?.lastName}</span>
                                        <span>•</span>
                                        <span>{timeAgo(post.createdAt)} ago</span>
                                        <span>•</span>
                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{post.category}</span>
                                    </div>
                                </div>

                                <NavLink to={`/discuss/${post._id}`} className="block">
                                    <h2 className="text-lg font-bold text-zinc-950 mb-1 group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                                        {post.content}
                                    </p>
                                </NavLink>

                                <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                    <NavLink to={`/discuss/${post._id}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.comments?.length || 0} Comments</span>
                                    </NavLink>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        <span>{post.views} Views</span>
                                    </div>
                                    <NavLink to={`/discuss/${post._id}`} className="ml-auto flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Read <ChevronRight className="w-3 h-3" />
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </main>

      {/* Professional Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-black text-zinc-900 text-xl tracking-tight">New Discussion</h3>
                    <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-all text-zinc-400"><X size={18} /></button>
                </div>
                
                <form onSubmit={handleCreatePost} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Subject</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Compensation for SDE-2 at Google"
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                            value={newPost.title}
                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Tag</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setNewPost({...newPost, category: cat.id})}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        newPost.category === cat.id 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Message</label>
                        <textarea 
                            required
                            placeholder="Share details or ask your question..."
                            className="w-full h-36 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-medium"
                            value={newPost.content}
                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] text-white transition-all shadow-xl ${
                            isSubmitting ? 'bg-zinc-300' : 'bg-zinc-950 hover:bg-zinc-800 shadow-zinc-200'
                        }`}
                    >
                        {isSubmitting ? 'Posting...' : 'Publish Post'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default DiscussionList;