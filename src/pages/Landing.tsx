import { Link } from 'react-router-dom';
import { Camera, Map, Users, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Camera size={20} className="text-slate-900" />
          </div>
          <span className="text-xl font-bold tracking-tight">HikeShot<span className="text-emerald-500 font-normal">.ai</span></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 overflow-hidden relative">
        <section className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000")' }}></div>
          <div className="relative z-10 p-8 flex flex-col h-full items-center justify-center text-center">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6 border border-emerald-500/30">The Adventure MVP</span>
            
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Your Hike.<br/>Your Memories.<br/><span className="text-emerald-400">One Gallery.</span>
            </h1>
            
            <p className="text-slate-400 text-sm mb-10 max-w-[240px]">
              Capture the adventure and share every moment with your hiking crew.
            </p>

            <div className="flex flex-col w-full gap-3 max-w-sm">
              <Link 
                to="/create" 
                className="flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                Create Hike
              </Link>
              
              <Link 
                to="/join" 
                className="flex items-center justify-center w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-base py-4 rounded-2xl transition-all active:scale-[0.98]"
              >
                Join Hike
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="px-6 py-4 bg-slate-950/80 border-t border-slate-900 flex justify-center items-center text-[10px] font-medium text-slate-500 tracking-wider uppercase">
        <p>HikeShot &copy; {new Date().getFullYear()} • MVP Testing Phase</p>
      </footer>
    </div>
  );
}
