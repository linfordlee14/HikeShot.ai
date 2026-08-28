import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { getHike, joinHike, Hike } from '../lib/db';

export default function JoinHike() {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [eventId, setEventId] = useState(urlId || '');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // If we came via URL with ID, verify it exists immediately
  useEffect(() => {
    if (urlId) {
      setEventId(urlId);
    }
  }, [urlId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId.trim() || !name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const code = eventId.trim().toUpperCase();
      const hike = await getHike(code);
      
      if (!hike) {
        setError("Event not found. Please check the code.");
        setLoading(false);
        return;
      }
      
      const participant = await joinHike(code, name.trim());
      
      // Store in local storage for session
      localStorage.setItem(`hikeshot_participant_${code}`, JSON.stringify({
        id: participant.id,
        name: participant.name
      }));
      
      // Go to camera
      navigate(`/hike/${code}/camera`);
    } catch (err) {
      console.error(err);
      setError("Failed to join hike. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col select-none">
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-slate-200 active:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold ml-2">Join Hike</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 max-w-md mx-auto w-full relative pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 to-transparent opacity-50 -z-10"></div>
        
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-5">
          <ImageIcon size={32} />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">Ready to capture the trail?</h2>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Event Code</label>
            <input 
              required
              type="text" 
              placeholder="e.g. A1B2C3" 
              className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 uppercase transition-all"
              value={eventId}
              onChange={(e) => setEventId(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Your First Name</label>
            <input 
              required
              type="text" 
              placeholder="What should we call you?" 
              className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin text-slate-900" size={24} /> : 'Join & Open Camera'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
