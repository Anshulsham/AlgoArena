import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import { 
  Plus, Trash2, Code, FileText, ChevronRight, 
  Save, ArrowLeft, Layers, Database, Sparkles 
} from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
    control, name: 'visibleTestCases'
  });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
    control, name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem architecture deployed successfully!');
      navigate('/admin');
    } catch (error) {
      alert(`Deployment Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-zinc-950 rounded-lg text-white flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform">AA</div>
            <span className="font-black text-lg tracking-tight">AlgoArena</span>
          </NavLink>
          <button
            onClick={() => navigate('/admin')}
            className="text-[12px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 flex items-center gap-2 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Admin Console
          </button>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-3">
            <Layers size={15} /> Problem Architect
          </div>
          <h1 className="text-4xl font-black text-zinc-950 tracking-tighter mb-3">Create Problem</h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md">
            Set Problem Details, Rules, and Test Cases
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Section 1: Metadata */}
          <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} />
            </div>
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100"><FileText size={20} className="text-indigo-600" /></div>
              <h2 className="text-xl font-black tracking-tight">Problem Details</h2>
            </div>

            <div className="grid gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Problem Title</label>
                <input
                  {...register('title')}
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-sm placeholder:text-zinc-300"
                  placeholder="e.g., Reactive Matrix Rotator"
                />
                {errors.title && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Problem Description</label>
                <textarea
                  {...register('description')}
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-sm h-40 resize-none"
                  placeholder="Define problem constraints and objectives..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Difficulty</label>
                  <select {...register('difficulty')} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-sm cursor-pointer hover:border-indigo-200 transition-colors appearance-none">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Problem Categories</label>
                  <select {...register('tags')} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-sm cursor-pointer hover:border-indigo-200 transition-colors appearance-none">
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Validation Nodes (Test Cases) */}
          <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100"><Database size={20} className="text-indigo-600" /></div>
              <h2 className="text-xl font-black tracking-tight">Verification Tests</h2>
            </div>

            <div className="space-y-12">
              {/* Visible Cases */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Visible Tests</h3>
                  <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                    <Plus size={14} /> Add Tests
                  </button>
                </div>
                <div className="grid gap-6">
                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 relative group animate-in slide-in-from-right-4 duration-300">
                      <button type="button" onClick={() => removeVisible(index)} className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Input Data</label>
                          <input {...register(`visibleTestCases.${index}.input`)} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Expected Result</label>
                          <input {...register(`visibleTestCases.${index}.output`)} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Reasoning</label>
                          <input {...register(`visibleTestCases.${index}.explanation`)} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Cases */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hidden Tests</h3>
                  <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-zinc-300 transition-all active:scale-95">
                    <Plus size={14} /> Add Edge Case
                  </button>
                </div>
                <div className="grid gap-6">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 relative group animate-in slide-in-from-left-4 duration-300">
                      <button type="button" onClick={() => removeHidden(index)} className="absolute top-4 right-4 p-2 text-zinc-700 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Input Data</label>
                          <input {...register(`hiddenTestCases.${index}.input`)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-300 focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Expected Result</label>
                          <input {...register(`hiddenTestCases.${index}.output`)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-300 focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Logic Blueprints */}
          <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100"><Code size={20} className="text-indigo-600" /></div>
              <h2 className="text-xl font-black tracking-tight">Starter Code</h2>
            </div>

            <div className="space-y-12">
              {['C++', 'Java', 'JavaScript'].map((language, index) => (
                <div key={language} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">{language} Implementation</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Starter Template</label>
                      <div className="rounded-3xl bg-zinc-950 p-2 border border-zinc-800 focus-within:border-indigo-500 transition-colors">
                        <textarea {...register(`startCode.${index}.initialCode`)} className="w-full h-48 p-4 bg-transparent text-indigo-300 font-mono text-xs outline-none resize-none" placeholder={`// Boilerplate for ${language}...`} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Optimal Solution</label>
                      <div className="rounded-3xl bg-zinc-950 p-2 border border-zinc-800 focus-within:border-emerald-500 transition-colors">
                        <textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full h-48 p-4 bg-transparent text-emerald-400 font-mono text-xs outline-none resize-none" placeholder={`// Complete solution for ${language}...`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submission Layer */}
          <div className="pt-10 border-t border-zinc-100">
            <div className="bg-zinc-950 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-indigo-500"><Sparkles size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform Integrity Check</p>
                  <p className="text-white font-bold tracking-tight">Review all test cases before publishing.</p>
                </div>
              </div>
              <button type="submit" className="w-full md:w-auto inline-flex items-center justify-center px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group">
                Publish Problem <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </form>

        <footer className="mt-16 text-center">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] leading-relaxed">
              Manage Resources &bull; AlgoArena Core &bull; {new Date().getFullYear()}
            </p>
        </footer>
      </main>
    </div>
  );
}

export default AdminPanel;