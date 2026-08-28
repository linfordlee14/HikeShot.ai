import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, MapPin, Calendar, Sparkles, Download, Share2, X, Users, Loader2, ArrowLeft } from 'lucide-react';
import { subscribeToPhotos, getHike, Hike, Photo } from '../lib/db';

export default function HikeGallery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [hike, setHike] = useState<Hike | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<{ id: string; name: string } | null>(null);
  
  // Lightbox state
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (id) {
      // Check for participant registration
      const stored = localStorage.getItem(`hikeshot_participant_${id}`);
      if (stored) {
        setParticipant(JSON.parse(stored));
      }

      getHike(id).then(h => {
        if (h) setHike(h);
      });

      const unsubscribe = subscribeToPhotos(id, (newPhotos) => {
        setPhotos(newPhotos);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [id]);

  const handleSharePhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `hikeshot-${photo.id}.jpg`, { type: blob.type });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `HikeShot - ${hike?.name || 'Photo'}`,
          text: `Photo taken by ${photo.participantName}`,
        });
      } else {
        window.open(photo.imageUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing photo:', err);
      window.open(photo.imageUrl, '_blank');
    }
  };

  if (loading && !hike) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <Loader2 className="animate-spin text-emerald-400 mb-3" size={36} />
        <p className="text-sm text-slate-400">Loading trail gallery...</p>
      </div>
    );
  }

  if (!hike) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 text-center">
        <p className="text-lg font-bold text-slate-200 mb-2">Hike Not Found</p>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">This event link may be expired or typed incorrectly.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32 select-none">
      
      {/* Sticky Header with Safe Area */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug truncate">{hike.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-medium">
                {hike.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-emerald-400 shrink-0" /> {hike.date}
                  </span>
                )}
                {hike.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={13} className="text-emerald-400 shrink-0" /> <span className="truncate">{hike.location}</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link 
                to={`/hike/${id}/find`}
                className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl hover:bg-slate-800 active:bg-slate-800 transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold"
                title="Find My Photos with AI"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">Find Me</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} className="text-emerald-400" /> 
              <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{photos.length}</span> photos
            </span>
            <span className="text-[11px] text-slate-500">Live Shared Stream</span>
          </div>
        </div>
      </header>

      {/* Main Gallery Grid */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-2.5 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="animate-spin text-emerald-400 mb-2" size={32} />
            <p className="text-xs">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <div className="w-16 h-16 bg-slate-900 text-emerald-400/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
              <Camera size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-200 mb-1">No photos yet</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-[260px] mb-6">
              Be the first to capture a view along the trail and share it with the group!
            </p>
            <button
              onClick={() => {
                if (participant) {
                  navigate(`/hike/${id}/camera`);
                } else {
                  navigate(`/join/${id}`);
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Add First Photo
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-2.5 sm:gap-3.5 space-y-2.5 sm:space-y-3.5">
            {photos.map(photo => (
              <div 
                key={photo.id} 
                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-800/80 active:scale-[0.98] transition-transform"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={`Shot by ${photo.participantName}`} 
                  className="w-full h-auto object-cover block rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                  <p className="text-white text-[11px] sm:text-xs font-semibold truncate drop-shadow-md">
                    {photo.participantName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Safe Area Anchored */}
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-0 right-0 flex justify-center z-30 pointer-events-none px-4">
        <button 
          onClick={() => {
            if (participant) {
              navigate(`/hike/${id}/camera`);
            } else {
              navigate(`/join/${id}`);
            }
          }}
          className="pointer-events-auto bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-2xl shadow-emerald-950/80 py-3.5 px-7 rounded-full flex items-center gap-2.5 font-bold text-base transition-transform active:scale-95 border border-emerald-400/30"
        >
          <Camera size={20} className="text-slate-950" />
          <span>{participant ? 'Add Photo' : 'Join Hike & Add Photos'}</span>
        </button>
      </div>

      {/* Full-Screen Lightbox / Photo Viewer */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 flex flex-col backdrop-blur-md">
          
          {/* Lightbox Header with Safe Area Top */}
          <header className="shrink-0 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between text-white border-b border-slate-800/60 bg-slate-950/80">
            <button 
              onClick={() => setSelectedPhoto(null)} 
              className="p-2 -ml-2 rounded-xl active:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Close photo viewer"
            >
              <X size={24} />
            </button>
            <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[200px] text-center">
              Photo by <span className="text-emerald-400">{selectedPhoto.participantName}</span>
            </div>
            <div className="w-8"></div>
          </header>
          
          {/* Photo Display */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-3 sm:p-6">
            <img 
              src={selectedPhoto.imageUrl} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
          
          {/* Lightbox Bottom Controls with Safe Area Bottom */}
          <div className="shrink-0 p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-center gap-4">
            <button 
              onClick={() => handleSharePhoto(selectedPhoto)}
              className="flex-1 max-w-[160px] bg-slate-900 hover:bg-slate-800 active:bg-slate-850 border border-slate-700 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-slate-200 text-sm font-bold transition-colors active:scale-[0.98]"
            >
              <Share2 size={18} className="text-emerald-400" />
              <span>Share</span>
            </button>
            <a 
              href={selectedPhoto.imageUrl} 
              download={`hikeshot-${selectedPhoto.id}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 max-w-[160px] bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <Download size={18} />
              <span>Download</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}

