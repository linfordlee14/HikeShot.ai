import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, MapPin, Calendar, Sparkles, Download, Share2, X, Users, Loader2 } from 'lucide-react';
import { subscribeToPhotos, getHike, Hike, Photo } from '../lib/db';
import { format } from 'date-fns';

export default function HikeGallery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [hike, setHike] = useState<Hike | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<{id: string, name: string} | null>(null);
  
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
        setHike(h);
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
      // Create a blob from the image URL to share natively
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `hikeshot-${photo.id}.jpg`, { type: blob.type });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Photo from HikeShot',
          text: `Photo taken by ${photo.participantName}`,
        });
      } else {
        // Fallback for sharing not supported
        window.open(photo.imageUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing photo:', err);
      // Fallback
      window.open(photo.imageUrl, '_blank');
    }
  };

  if (loading && !hike) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;
  }

  if (!hike) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p>Event not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24">
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100 leading-tight">{hike.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                {hike.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {hike.date}
                  </span>
                )}
                {hike.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {hike.location}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link 
                to={`/hike/${id}/find`}
                className="p-2 bg-slate-800 text-emerald-400 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
                title="Find My Photos"
              >
                <Sparkles size={20} />
              </Link>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400 bg-slate-800/40 rounded-lg p-2 border border-slate-700/50">
            <span className="flex items-center gap-1.5"><ImageIcon size={14} /> <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">{photos.length}</span> photos</span>
            <span>Visible to all participants</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-2 sm:p-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
            <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
              <Camera size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-300 mb-1">No photos yet</h2>
            <p className="text-slate-500 text-sm max-w-[250px]">Be the first to capture a moment on this hike!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {photos.map(photo => (
              <div 
                key={photo.id} 
                className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer bg-slate-800 border border-slate-700/50"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={`By ${photo.participantName}`} 
                  className="w-full object-cover block"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold truncate">{photo.participantName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none px-4">
        <button 
          onClick={() => {
            if (participant) {
              navigate(`/hike/${id}/camera`);
            } else {
              navigate(`/join/${id}`);
            }
          }}
          className="pointer-events-auto bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-xl shadow-slate-900/50 py-3.5 px-8 rounded-full flex items-center gap-3 font-bold text-lg transition-transform active:scale-95 border border-slate-700"
        >
          <Camera size={24} className="text-emerald-400" />
          <span>{participant ? 'Take Shot' : 'Join to take photos'}</span>
        </button>
      </div>

      {/* Lightbox / Photo Viewer */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-md">
          <header className="p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent">
            <button onClick={() => setSelectedPhoto(null)} className="p-2 -ml-2 rounded-full active:bg-white/10">
              <X size={24} />
            </button>
            <div className="text-sm font-medium text-stone-300">
              By {selectedPhoto.participantName}
            </div>
            <div className="w-10"></div>
          </header>
          
          <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
            <img 
              src={selectedPhoto.imageUrl} 
              alt="View" 
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>
          
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-6">
            <button 
              onClick={() => handleSharePhoto(selectedPhoto)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              <Share2 size={24} />
            </button>
            <a 
              href={selectedPhoto.imageUrl} 
              download={`hikeshot-${selectedPhoto.id}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
            >
              <Download size={24} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
