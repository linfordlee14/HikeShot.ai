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
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-100">
      <header className="p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Organizer Dashboard</h1>
        <button onClick={() => navigate(`/hike/${id}`)} className="text-emerald-400 font-medium flex items-center gap-1 hover:text-emerald-300 transition-colors">
          Gallery <ArrowRight size={18} />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-100">{hike.name}</h2>
          <p className="text-slate-400 font-medium">{hike.date} &bull; {hike.location || 'No location'}</p>
        </div>

        <div className="bg-emerald-600 rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 mb-6 text-center">
            <h3 className="text-xl font-bold mb-1">Share Hike</h3>
            <p className="text-emerald-100 text-sm">Invite your crew with a scan</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <QRCodeSVG value={joinUrl} size={180} fgColor="#0f172a" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Event Code</span>
              <span className="text-3xl font-mono font-bold tracking-widest">{id}</span>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 bg-slate-800 border border-slate-700 py-4 rounded-2xl active:bg-slate-700 transition-colors">
            <Share2 size={24} className="text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">Share</span>
          </button>
          
          <button onClick={handleCopyLink} className="flex flex-col items-center justify-center gap-2 bg-slate-800 border border-slate-700 py-4 rounded-2xl active:bg-slate-700 transition-colors">
            <Copy size={24} className={copied ? "text-emerald-400" : "text-emerald-400"} />
            <span className="text-sm font-bold text-slate-200">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          
          <button onClick={handleWhatsApp} className="col-span-2 flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-4 rounded-2xl active:opacity-90 transition-opacity">
            <span>Share on WhatsApp</span>
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="font-bold text-slate-300">Danger Zone</h3>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                navigate('/');
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-950/50 transition-colors text-red-400 py-4 rounded-2xl border border-red-900/50 active:scale-[0.98] font-bold"
          >
            <Trash2 size={20} />
            <span>Delete Event</span>
          </button>
        </div>
      </main>
    </div>
  );
}
