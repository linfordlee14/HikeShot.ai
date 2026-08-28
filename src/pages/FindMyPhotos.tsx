import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Upload, Loader2, Info, AlertCircle } from 'lucide-react';
import { getHikePhotos, Photo } from '../lib/db';
import { compressImage } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

export default function FindMyPhotos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Photo[] | null>(null);
  const [serviceUnavailableMessage, setServiceUnavailableMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setLoading(true);
    setResults(null);
    setServiceUnavailableMessage(null);

    try {
      // 1. Compress selfie
      const compressedSelfie = await compressImage(file);
      setSelfie(compressedSelfie.dataUrl);

      // 2. Fetch all event photos
      const photos = await getHikePhotos(id);
      
      if (photos.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!geminiApiKey) {
        // Safe graceful notification when key is not configured
        setServiceUnavailableMessage("AI photo matching is temporarily unavailable. Your photos are still safe.");
        setLoading(false);
        return;
      }

      // 3. Client-side Gemini comparison with graceful fail-safe
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        // Extract raw base64 data (strip prefix)
        const getBase64Data = (dataUrl: string) => {
          const parts = dataUrl.split(',');
          return parts.length > 1 ? parts[1] : dataUrl;
        };

        const selfieBase64Data = getBase64Data(compressedSelfie.dataUrl);

        // Process up to 10 photos at a time to prevent payload exhaustion
        const photosToScan = photos.slice(0, 15);
        
        const contents: any[] = [
          {
            text: `You are an accurate face identification system. Compare the person in the Reference Selfie with each numbered gallery photo. Return ONLY a JSON array of the string IDs of photos where the same person clearly appears. Example response format: ["photo_id_1", "photo_id_2"]. If no match, return [].`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: selfieBase64Data
            }
          }
        ];

        photosToScan.forEach((photo) => {
          contents.push({
            text: `Gallery Photo ID: ${photo.id}`
          });
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: getBase64Data(photo.imageUrl)
            }
          });
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const responseText = response.text || '[]';
        const matchedIds: string[] = JSON.parse(responseText);

        if (Array.isArray(matchedIds)) {
          const matchedPhotos = photos.filter(p => matchedIds.includes(p.id));
          setResults(matchedPhotos);
        } else {
          setResults([]);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini AI feature gracefully degraded:', geminiErr);
        setServiceUnavailableMessage("AI photo matching is temporarily unavailable. Your photos are still safe.");
      }

    } catch (err) {
      console.error('Error processing photo:', err);
      setServiceUnavailableMessage("AI photo matching is temporarily unavailable. Your photos are still safe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="p-4 flex items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2 flex items-center gap-2 text-slate-100">
          <Sparkles size={20} className="text-emerald-400" /> Find My Photos
        </h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col items-center">
        {!selfie ? (
          <div className="flex flex-col items-center justify-center text-center mt-12 w-full">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-500/30">
              <Sparkles size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100 mb-3">Let AI find you</h2>
            
            <p className="text-slate-400 mb-8 max-w-[280px]">
              Upload a quick selfie, and our AI will scan the event gallery for photos of you.
            </p>

            {/* Dual Input: Take Selfie vs Gallery */}
            <input 
              type="file" 
              accept="image/*" 
              capture="user" 
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={galleryInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Upload size={20} />
                Take Selfie
              </button>

              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-850 text-slate-100 font-bold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98]"
              >
                <span>Choose From Gallery</span>
              </button>
            </div>
            
            <div className="mt-8 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <Info size={16} className="shrink-0 mt-0.5 text-emerald-500/70" />
              <p>This is an optional feature. Selfies are analyzed securely and never saved or shared.</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Selfie thumbnail */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 shadow-md mb-8 z-10 bg-slate-800">
              <img src={selfie} alt="Your selfie" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-400" size={24} />
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center text-center mt-4">
                <Sparkles className="text-emerald-400 animate-pulse mb-4" size={32} />
                <h3 className="text-lg font-bold text-slate-100 mb-2">Analyzing gallery...</h3>
                <p className="text-sm text-slate-400">Scanning photos for matches using AI.</p>
              </div>
            ) : serviceUnavailableMessage ? (
              <div className="text-center mt-4 animate-in fade-in duration-300 w-full">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6 text-center">
                  <AlertCircle size={36} className="text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-amber-200 mb-2">Notice</h3>
                  <p className="text-sm text-slate-300">
                    {serviceUnavailableMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate(`/hike/${id}`)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    View All Hike Photos
                  </button>
                  <button 
                    onClick={() => {
                      setSelfie(null);
                      setResults(null);
                      setServiceUnavailableMessage(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-xl border border-slate-700 transition-colors"
                  >
                    Try Another Selfie
                  </button>
                </div>
              </div>
            ) : results && results.length > 0 ? (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-100">We found {results.length} photos!</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {results.map((photo) => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square border border-slate-700 shadow-sm bg-slate-800">
                      <img 
                        src={photo.imageUrl} 
                        alt="Match" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    setSelfie(null);
                    setResults(null);
                  }}
                  className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-2xl border border-slate-700 transition-colors"
                >
                  Try another selfie
                </button>
              </div>
            ) : (
              <div className="text-center mt-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-100 mb-2">No matches found</h3>
                <p className="text-sm text-slate-400 mb-6">We couldn't find you in the current event photos.</p>
                <button 
                  onClick={() => {
                    setSelfie(null);
                    setResults(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-xl border border-slate-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

