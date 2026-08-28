import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Image, Users, Trash2, ArrowRight } from 'lucide-react';
import { getHike, Hike } from '../lib/db';

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const joinUrl = `${window.location.origin}/join/${id}`;

  useEffect(() => {
    if (id) {
      getHike(id).then(data => {
        setHike(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && hike) {
      try {
        await navigator.share({
          title: `Join ${hike.name} on HikeShot`,
          text: `📸 Join our HikeShot gallery!\n\nJoin the ${hike.name} hike and see/upload photos from the hike.\n\nScan or tap the link to join.`,
          url: joinUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    if (!hike) return;
    const text = encodeURIComponent(`📸 Join our HikeShot gallery!\n\nJoin the ${hike.name} hike and see/upload photos from the hike.\n\nScan or tap the link to join.\n\n${joinUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100"><p>Loading event...</p></div>;
  }

  if (!hike) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100"><p className="mb-4">Event not found.</p><button onClick={() => navigate('/')} className="text-emerald-400 font-bold">Go Home</button></div>;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col text-slate-100 select-none">
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-10">
        <h1 className="text-lg sm:text-xl font-bold">Organizer Dashboard</h1>
        <button onClick={() => navigate(`/hike/${id}`)} className="text-emerald-400 font-medium flex items-center gap-1 hover:text-emerald-300 transition-colors text-sm">
          Gallery <ArrowRight size={16} />
        </button>
      </header>

      <main className="flex-1 p-5 sm:p-6 max-w-md mx-auto w-full flex flex-col gap-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">{hike.name}</h2>
          <p className="text-slate-400 font-medium text-xs sm:text-sm">{hike.date} &bull; {hike.location || 'No location'}</p>
        </div>

        <div className="bg-emerald-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-emerald-950/50">
          <div className="relative z-10 mb-4 text-center">
            <h3 className="text-lg sm:text-xl font-bold mb-0.5">Share Hike</h3>
            <p className="text-emerald-100 text-xs sm:text-sm">Invite your crew with a scan</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <QRCodeSVG value={joinUrl} size={160} fgColor="#020617" />
            </div>
            <div className="flex flex-col gap-0.5 items-center">
              <span className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Event Code</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest">{id}</span>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 bg-slate-900 border border-slate-800 py-3.5 rounded-2xl active:bg-slate-800 transition-colors">
            <Share2 size={22} className="text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200">Share</span>
          </button>
          
          <button onClick={handleCopyLink} className="flex flex-col items-center justify-center gap-2 bg-slate-900 border border-slate-800 py-3.5 rounded-2xl active:bg-slate-800 transition-colors">
            <Copy size={22} className="text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          
          <button onClick={handleWhatsApp} className="col-span-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold py-3.5 rounded-2xl active:scale-[0.98] transition-all shadow-md">
            <span>Share on WhatsApp</span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Danger Zone</h3>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to exit to home?')) {
                navigate('/');
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 transition-colors text-red-400 py-3.5 rounded-2xl border border-red-900/40 active:scale-[0.98] font-bold text-sm"
          >
            <Trash2 size={18} />
            <span>Leave Dashboard</span>
          </button>
        </div>
      </main>
    </div>
  );
}
