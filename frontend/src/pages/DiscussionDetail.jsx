import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { 
  ArrowLeft, MessageSquare, Send, Trash2, 
  ChevronRight, Calendar, Tag, ShieldAlert
} from 'lucide-react';

function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axiosClient.get(`/discuss/get/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: newComment } = await axiosClient.post(`/discuss/comment/${id}`, { content: commentText });
      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
      setCommentText("");
    } catch (error) {
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Permanently delete this discussion?")) return;
    try {
      await axiosClient.delete(`/discuss/delete/${id}`);
      navigate('/discuss');
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosClient.delete(`/discuss/comment/${commentId}`);
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!post) return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-zinc-300" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[15px]">Discussion Not Found</p>
        <button onClick={() => navigate('/discuss')} className="text-indigo-600 font-bold text-sm hover:underline">Return to Community</button>
    </div>
  );

  const isOwner = user?._id === post.author?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 pb-24 selection:bg-indigo-100">
      
      {/* --- Premium Sub-Header Navigation --- */}
      <nav className="border-b border-zinc-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-[850px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/discuss')} 
                    className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 transition-all flex items-center gap-2 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[15px] font-black uppercase tracking-widest hidden sm:block">Back</span>
                </button>
                <div className="h-4 w-px bg-zinc-200 mx-2 hidden sm:block" />
                <div className="flex items-center gap-2 text-zinc-400 text-[13px] font-black uppercase tracking-[0.15em]">
                    <span>Community</span>
                    <ChevronRight size={15} />
                    <span className="text-zinc-900 line-clamp-1 max-w-[200px]">{post.category}</span>
                </div>
            </div>
            
            {(isOwner || isAdmin) && (
                <button 
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-[15px] font-black uppercase tracking-widest"
                >
                    <Trash2 size={14} /> Delete Post
                </button>
            )}
        </div>
      </nav>

      <div className="max-w-[850px] mx-auto px-6 py-10 space-y-8">
        
        {/* --- Main Post Architecture --- */}
        <article className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8 md:p-10">
                <header className="mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black text-lg shadow-xl transform -rotate-1">
                            {post.author?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                            <div className="font-black text-zinc-950 text-base tracking-tight capitalize leading-none mb-2">
                                {post.author?.firstName} {post.author?.lastName}
                            </div>
                            <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-500" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50"><Tag size={10} /> {post.category}</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-zinc-950 tracking-tighter leading-tight">
                        {post.title}
                    </h1>
                </header>

                <div className="prose prose-zinc max-w-none text-zinc-700 text-[17px] leading-relaxed whitespace-pre-wrap font-medium">
                    {post.content}
                </div>
            </div>
        </article>

        {/* --- Dynamic Comment Section --- */}
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-100">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                    <MessageSquare className="text-indigo-500" size={22} />
                    Discussion <span className="text-zinc-300 font-medium">({post.comments?.length || 0})</span>
                </h3>
            </div>

            {/* Comment Thread */}
            <div className="space-y-8 mb-12">
                {post.comments?.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-zinc-200">
                            <MessageSquare size={24} className="text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">No contributors yet</p>
                    </div>
                ) : (
                    post.comments.map(comment => {
                        const isCommentOwner = user?._id === comment.author?._id;
                        return (
                            <div key={comment._id} className="flex gap-4 group relative">
                                <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-black text-xs shrink-0">
                                    {comment.author?.firstName?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-zinc-950 text-[13px] capitalize tracking-tight">
                                                {comment.author?.firstName} {comment.author?.lastName}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        {(isCommentOwner || isAdmin) && (
                                            <button 
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Remove Comment"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-zinc-600 text-sm font-medium leading-relaxed bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Premium Compose Box */}
            <div className="mt-8 pt-8 border-t border-zinc-100">
                <form onSubmit={handlePostComment} className="relative group">
                    <textarea
                        required
                        placeholder="Contribute to this discussion..."
                        className="w-full pl-6 pr-16 py-5 bg-zinc-50 border border-zinc-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px] text-sm font-medium text-zinc-900 placeholder:text-zinc-300"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !commentText.trim()}
                        className="absolute right-3 bottom-3 p-3 bg-zinc-950 text-white rounded-2xl hover:bg-indigo-600 disabled:opacity-30 shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}

export default DiscussionDetail;