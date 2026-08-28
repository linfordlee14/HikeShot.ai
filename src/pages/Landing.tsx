import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-100 overflow-x-hidden select-none">
      
      {/* Header with Safe Area Top */}
      <header className="flex items-center justify-between px-5 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Camera size={18} className="text-slate-950 font-bold" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">HikeShot</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 relative justify-center">
        <section className="flex-1 min-h-[440px] bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col relative justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-[1px]" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000")' }}
          ></div>
          
          <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full items-center justify-center text-center">
            <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 border border-emerald-500/20">
              Instant Group Trail Photos
            </span>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-3 text-slate-100 max-w-xs sm:max-w-md">
              Your Hike.<br/>Your Memories.<br/><span className="text-emerald-400">One Gallery.</span>
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-[280px] leading-relaxed">
              Snap and share photos with your entire hiking crew with zero app installs or account signups.
            </p>

            <div className="flex flex-col w-full gap-3 max-w-xs sm:max-w-sm">
              <Link 
                to="/create" 
                className="flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-base py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                Create Hike
              </Link>
              
              <Link 
                to="/join" 
                className="flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 font-bold text-base py-4 rounded-2xl border border-slate-700 transition-all active:scale-[0.98]"
              >
                Join Hike
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer with Safe Area Bottom */}
      <footer className="px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-slate-950 border-t border-slate-900 flex justify-center items-center text-[10px] font-medium text-slate-500 tracking-wider uppercase">
        <p>HikeShot &bull; Saturday MVP</p>
      </footer>
    </div>
  );
}

