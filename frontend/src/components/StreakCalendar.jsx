import React from 'react';
import { Flame, Check, CalendarDays, Zap } from 'lucide-react';

const StreakCalendar = ({ solvedDates = [], streakCount = 0, isDarkMode = false }) => {
    const today = new Date();
    const currentMonth = today.getMonth(); 
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const emptySlots = Array.from({ length: firstDayOfMonth });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    return (
        <div className={`rounded-[2rem] border shadow-sm p-6 w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
            {/* Header Strategy */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                        <CalendarDays size={14} /> Consistency
                    </div>
                    <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                        {monthNames[currentMonth]}
                    </h3>
                </div>
                
                {/* Tactical Streak Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 ml-2 rounded-xl border transition-all mb-1 ${
                    isDarkMode 
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                    : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                    <span className="font-black text-xs uppercase tracking-widest">{streakCount} Day Streak</span>
                </div>
            </div>

            {/* Calendar Grid Architecture */}
            <div className="grid grid-cols-7 gap-2">
                {/* Weekdays Standardized */}
                {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-[9px] text-zinc-500 text-center font-black uppercase tracking-widest pb-2">
                        {d}
                    </div>
                ))}
                
                {/* Empty Slots */}
                {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Actual Days Logic */}
                {daysArray.map(day => {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSolved = solvedDates.includes(dateStr);
                    const isToday = day === today.getDate();

                    return (
                        <div 
                            key={day}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-[11px] font-black transition-all relative group
                                ${isSolved 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                    : isDarkMode ? 'bg-zinc-950 text-zinc-700 border border-zinc-800' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'
                                }
                                ${isToday && !isSolved ? (isDarkMode ? 'border-orange-500/50 text-orange-400' : 'border-2 border-orange-400 text-orange-500 bg-orange-50') : ''}
                            `}
                        >
                            {day}
                            {isSolved && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-indigo-600 animate-in zoom-in duration-300">
                                    <Check className="w-2.5 h-2.5 text-indigo-600" strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Footer Metadata */}
            <div className={`mt-8 pt-6 border-t flex items-center gap-3 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                    <Zap size={14} className="text-indigo-500" />
                </div>
                <p className={`text-[10px] font-bold leading-relaxed uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Publish <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}>POTD Solution</span> to maintain streak integrity
                </p>
            </div>
        </div>
    );
};

export default StreakCalendar;