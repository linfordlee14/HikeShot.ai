import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Calendar, User } from 'lucide-react';
import { createHike } from '../lib/db';

export default function CreateHike() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    organizerName: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const hikeId = await createHike(formData);
      // Navigate to admin dashboard to show QR code and share link
      navigate(`/admin/${hikeId}`);
    } catch (error: any) {
      console.error("Failed to create hike", error);
      setErrorMsg(error.message || "Failed to create the hike. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col select-none">
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-200 active:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold ml-2">Create New Hike</h1>
      </header>

      <main className="flex-1 p-5 sm:p-6 max-w-md mx-auto w-full pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Event Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Constantia Nek Hike" 
              className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                required
                type="date" 
                className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Location (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Where are you hiking?" 
                className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Organizer Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                required
                type="text" 
                placeholder="Your name" 
                className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                value={formData.organizerName}
                onChange={(e) => setFormData({...formData, organizerName: e.target.value})}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin text-slate-900" size={24} /> : 'Create Event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
