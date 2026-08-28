import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, X, Upload, CheckCircle, Image as ImageIcon, Loader2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { uploadPhoto, getHike, Hike } from '../lib/db';
import { compressImage } from '../lib/utils';

export default function CameraCapture() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Separate refs for native Camera vs Gallery picker
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [hike, setHike] = useState<Hike | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');
  const [participant, setParticipant] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`hikeshot_participant_${id}`);
      if (stored) {
        setParticipant(JSON.parse(stored));
      } else {
        // Redirect to join if not registered
        navigate(`/join/${id}`);
      }

      getHike(id).then(h => {
        if (h) setHike(h);
      });
    }
  }, [id, navigate]);

  const handleCameraClick = () => {
    setError('');
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    setError('');
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setSuccess(false);
      setError('');
    }
  };

  const handleReset = () => {
    setPhoto(null);
    setPreview(null);
    setSuccess(false);
    setError('');
    setStatusText('');
  };

  const handleUpload = async () => {
    if (!photo || !id || !participant || uploading) return;
    
    setUploading(true);
    setError('');
    setStatusText('Compressing photo...');
    
    try {
      // Compress and resize image client-side to keep under 300KB
      const compressed = await compressImage(photo);
      
      setStatusText(`Uploading (${compressed.sizeKb} KB)...`);
      await uploadPhoto(id, participant.id, participant.name, compressed.dataUrl);
      
      setSuccess(true);
      setUploading(false);
      setStatusText('');
      
      // Auto redirect to gallery after 1.5s
      setTimeout(() => {
        navigate(`/hike/${id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('ad-blocker') || err.message.includes('too large') || err.message.includes('limit'))) {
        setError(err.message);
      } else {
        setError("Network interruption: Upload failed. Please check your connection and retry.");
      }
      setUploading(false);
      setStatusText('');
    }
  };

  if (!hike || !participant) {
    return (
      <div className="h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-emerald-400 mb-3" size={36} />
        <p className="text-sm text-slate-400">Loading hike details...</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* Hidden File Inputs: Camera & Gallery */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="camera-input"
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="gallery-input"
      />

      {/* Top Header - Safe Area Padding */}
      <header className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-20">
        <button 
          onClick={() => navigate(`/hike/${id}`)} 
          className="p-2 -ml-2 rounded-xl active:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to gallery"
          aria-label="Back to gallery"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center text-center px-2 min-w-0">
          <h1 className="text-sm font-bold truncate max-w-[200px] text-slate-100">{hike.name}</h1>
          <p className="text-xs text-emerald-400 font-medium truncate">Posting as {participant.name}</p>
        </div>
        <button 
          onClick={() => navigate(`/hike/${id}`)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
        >
          Gallery
        </button>
      </header>

      {/* Main View Area */}
      {!preview ? (
        <main className="flex-1 flex flex-col justify-center items-center p-6 text-center overflow-y-auto">
          <div className="w-full max-w-sm flex flex-col items-center">
            
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
              <Camera size={40} strokeWidth={1.75} />
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-2">Capture the Trail</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
              Share your photos with everyone on <span className="text-slate-200 font-semibold">{hike.name}</span> in real time.
            </p>

            <div className="w-full flex flex-col gap-3.5">
              {/* Option 1: 📸 Take Photo */}
              <button 
                onClick={handleCameraClick}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Camera size={22} />
                <span>Take Photo</span>
              </button>

              {/* Option 2: 🖼️ Choose From Gallery */}
              <button 
                onClick={handleGalleryClick}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-850 text-slate-100 font-bold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-3 border border-slate-700 transition-all active:scale-[0.98]"
              >
                <ImageIcon size={22} className="text-emerald-400" />
                <span>Choose From Gallery</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-6">
              Photos are optimized automatically before upload.
            </p>
          </div>
        </main>
      ) : (
        /* Photo Preview & Upload Controls */
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          
          {/* Photo Preview Container - Responsive & contained */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-slate-950/60">
            <img 
              src={preview} 
              alt="Photo preview" 
              className="max-w-full max-h-full object-contain rounded-2xl border border-slate-800/80 shadow-2xl bg-black/40"
            />
          </div>

          {/* Bottom Action Controls - Always visible, anchored, Safe Area padded */}
          <div className="shrink-0 w-full p-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 z-30">
            <div className="max-w-md mx-auto flex flex-col gap-3">
              
              {/* Error Banner */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0 text-red-400" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {success ? (
                <div className="flex flex-col gap-2">
                  <div className="bg-emerald-500 text-slate-950 p-3.5 rounded-xl flex items-center justify-center gap-2.5 font-bold shadow-lg shadow-emerald-500/20 text-sm sm:text-base">
                    <CheckCircle size={22} className="text-slate-950" />
                    <span>✓ Photo uploaded! 📸</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/hike/${id}`)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm font-bold transition-colors border border-slate-700"
                  >
                    View Gallery
                  </button>
                </div>
              ) : (
                /* Primary Actions Bar */
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Retake / Change Button */}
                  <button 
                    onClick={handleReset}
                    disabled={uploading}
                    className="w-full sm:w-1/3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 py-3.5 px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 border border-slate-700 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <RefreshCw size={16} />
                    <span>Retake</span>
                  </button>
                  
                  {/* Upload Photo Button */}
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full sm:w-2/3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 active:scale-[0.98]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin text-slate-950" size={18} />
                        <span>{statusText || 'Uploading photo...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>{error ? 'Retry Upload' : 'Upload Photo'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Progress bar line when uploading */}
              {uploading && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full animate-pulse w-3/4"></div>
                </div>
              )}

            </div>
          </div>

        </main>
      )}

    </div>
  );
}

