import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, X, Upload, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadPhoto, getHike, Hike } from '../lib/db';
import { compressImage } from '../lib/utils';

export default function CameraCapture() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hike, setHike] = useState<Hike | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [participant, setParticipant] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    // Check for participant in local storage
    if (id) {
      const stored = localStorage.getItem(`hikeshot_participant_${id}`);
      if (stored) {
        setParticipant(JSON.parse(stored));
      } else {
        // Redirect to join if not registered for this hike
        navigate(`/join/${id}`);
      }

      getHike(id).then(h => {
        if (h) setHike(h);
      });
    }
  }, [id, navigate]);

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

  const handleRetake = () => {
    setPhoto(null);
    setPreview(null);
    setSuccess(false);
    setError('');
    handleCaptureClick();
  };

  const [statusText, setStatusText] = useState('');

  const handleUpload = async () => {
    if (!photo || !id || !participant) return;
    
    setUploading(true);
    setError('');
    setStatusText('Compressing photo...');
    
    try {
      // Aggressively compress before upload to save bandwidth & stay well under limits
      const compressed = await compressImage(photo);
      
      setStatusText(`Uploading (${compressed.sizeKb} KB)...`);
      await uploadPhoto(id, participant.id, participant.name, compressed.dataUrl);
      
      setSuccess(true);
      setUploading(false);
      setStatusText('');
      
      // Clear after short delay and navigate to gallery
      setTimeout(() => {
        navigate(`/hike/${id}`);
      }, 1200);
      
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('ad-blocker') || err.message.includes('too large'))) {
        setError(err.message);
      } else {
        setError("Network interruption: Upload failed. Please check your connection and retry.");
      }
      setUploading(false);
      setStatusText('');
    }
  };

  if (!hike || !participant) {
    return <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-6"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col fixed inset-0">
      <header className="p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-slate-950/80 to-transparent">
        <button onClick={() => navigate(`/hike/${id}`)} className="p-2 -ml-2 rounded-full active:bg-white/10 text-slate-300">
          <X size={28} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold truncate max-w-[200px] text-slate-100">{hike.name}</h1>
          <p className="text-xs text-emerald-400">Uploading as {participant.name}</p>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 flex flex-col relative justify-center items-center overflow-hidden">
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center z-10">
            <button 
              onClick={handleCaptureClick}
              className="w-32 h-32 rounded-full border-4 border-emerald-500 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-8 active:scale-95 transition-transform"
            >
              <Camera size={48} strokeWidth={1.5} />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Tap to take photo</h2>
            <p className="text-slate-400 max-w-xs">Photos are uploaded to the shared gallery</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col">
            <img 
              src={preview} 
              alt="Preview" 
              className="flex-1 object-contain bg-slate-950 w-full"
            />
            
            {/* Overlay UI */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col gap-4">
              
              {success ? (
                <div className="bg-emerald-500 text-slate-900 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                  <CheckCircle size={24} />
                  Photo uploaded! 📸
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-500/90 text-white p-3 rounded-xl text-center text-sm font-bold backdrop-blur-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button 
                      onClick={handleRetake}
                      disabled={uploading}
                      className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-slate-200 py-4 rounded-2xl font-bold transition-colors disabled:opacity-50 border border-slate-700"
                    >
                      Retake
                    </button>
                    
                      <button 
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="animate-spin text-slate-900" size={20} />
                            {statusText || 'Uploading...'}
                          </>
                        ) : (
                          <>
                            <Upload size={20} />
                            {error ? 'Retry Upload' : 'Upload to Gallery'}
                          </>
                        )}
                      </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Visual background if no preview */}
      {!preview && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950"></div>
      )}
    </div>
  );
}
