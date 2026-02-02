import React from 'react';
import { 
  Plus, Edit, Trash2, Home, Video, Settings, 
  BarChart, Users, ChevronRight, ShieldCheck,
  LayoutGrid, Sparkles
} from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'New Problem', // Simplified from "Create Problem"
      description: 'Add new coding challenges and test cases', // Simplified from "Architect challenges"
      icon: Plus,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Edit Content', // Simplified from "Update Problem"
      description: 'Modify problem details or solution logic', // Simplified from "Refine logic/assets"
      icon: Edit,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/50',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Remove Problem', // Simplified from "Delete Problem"
      description: 'Permanently remove challenges from the library', // Simplified from "Decommission assets"
      icon: Trash2,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/50',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Guides', // Simplified from "Editorial Media"
      description: 'Upload and manage solution walkthroughs', // Simplified from "High-resolution walk-throughs"
      icon: Video,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50',
      route: '/admin/video'
    },
    {
      id: 'analytics',
      title: 'User Analytics', // Simplified from "Platform Insights"
      description: 'Track how students are performing on problems', // Simplified from "Monitor progression"
      icon: BarChart,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      route: '/admin/analytics'
    },
    {
      id: 'users',
      title: 'Manage Users', // Simplified from "User Governance"
      description: 'Manage account access and permissions', // Simplified from "Control governance"
      icon: Users,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      route: '/admin/users'
    }
  ];

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
              <span className="font-black text-lg tracking-tight">AlgoArena</span>
            </NavLink>
            <div className="hidden md:flex items-center px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200/50">
                <span className="text-[12px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-indigo-600" /> Secure Admin Access
                </span>
            </div>
          </div>

          <NavLink 
              to="/" 
              className="text-[13px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 flex items-center gap-2 transition-all group"
          >
              <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              Exit to Site
          </NavLink>
        </div>
      </nav>

      {/* Main Layout Container */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* Modern Header Section */}
        <div className="mb-12">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[13px] uppercase tracking-[0.2em] mb-3">
                <LayoutGrid size={16} /> Dashboard Overview
            </div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tighter mb-3">Admin Panel</h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md">
                Manage your coding library, monitor student progress, and keep the platform running smoothly.
            </p>
        </div>

        {/* Admin Command Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminOptions.map((option) => {
              const Icon = option.icon;
              return (
                <NavLink
                  key={option.id}
                  to={option.route}
                  className="group block"
                >
                  <div className="h-full bg-white border border-zinc-200 rounded-3xl p-8 hover:border-indigo-500 hover:shadow-4xl hover:shadow-indigo-950/10 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-zinc-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                    
                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-2xl ${option.bgColor} border border-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon className={`${option.iconColor}`} size={20} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-zinc-950 tracking-tight flex items-center justify-between">
                                {option.title}
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </h3>
                            <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
                                {option.description}
                            </p>
                        </div>
                    </div>
                  </div>
                </NavLink>
              );
            })}
        </div>

        {/* Management Information Footer */}
        <footer className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-300">
                <Sparkles size={15} /> System Fully Operational
            </div>
            <p className="text-[14px] font-bold text-zinc-400">
                &copy; {new Date().getFullYear()} AlgoArena Team &bull; Internal Dashboard
            </p>
        </footer>
      </main>
    </div>
  );
}

export default Admin;