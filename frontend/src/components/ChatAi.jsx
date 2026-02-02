import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

function ChatAi({ problem, isDarkMode }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I'm your AI technical assistant. How can I help you optimize or debug your solution for this challenge?" }] },
    ]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = data.message;
        const updatedMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
        
        setMessages(updatedMessages);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem?.title || "Unknown Problem",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode || []
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "System error detected. Unable to reach AI node. Please verify your connection." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col h-full rounded-[2rem] overflow-hidden border transition-colors duration-300 shadow-2xl ${
            isDarkMode ? 'border-zinc-800 bg-zinc-950 shadow-indigo-500/5' : 'border-zinc-200 bg-white'
        }`}>
            
            {/* --- AI Header Meta --- */}
            <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
                isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>AI Assistant</h3>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Smart Hint Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active</span>
                </div>
            </div>

            {/* --- Messages Logic Environment --- */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar ${isDarkMode ? 'bg-zinc-950' : 'bg-[#FAFAFA]'}`}>
                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={index} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar Logic */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all ${
                                    isUser 
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                        : (isDarkMode ? 'bg-zinc-900 border-zinc-800 text-indigo-400' : 'bg-white border-zinc-200 text-indigo-600 shadow-sm')
                                }`}>
                                    {isUser ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                {/* Bubble Architecture */}
                                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed transition-all ${
                                        isUser 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : (isDarkMode ? 'bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none' : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none shadow-sm')
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-2">
                                        {isUser ? 'User Request' : 'AI Output'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Tactical Input System --- */}
            <div className={`p-6 border-t transition-colors ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'
            }`}>
                <form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="relative group"
                >
                    <input 
                        type="text"
                        placeholder="Query technical details..." 
                        autoComplete="off"
                        disabled={isLoading}
                        className={`w-full pl-5 pr-14 py-4 rounded-2xl border transition-all duration-300 outline-none text-sm font-bold placeholder:text-zinc-500 ${
                            isDarkMode 
                                ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'
                        }`}
                        {...register("message", { required: true, minLength: 1 })}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isLoading 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-zinc-950 text-white hover:bg-indigo-600 shadow-lg active:scale-95'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send size={18} fill="currentColor" />
                        )}
                    </button>
                </form>
                
                <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                    <AlertCircle size={10} className="text-zinc-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        AI Analysis Active
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ChatAi;