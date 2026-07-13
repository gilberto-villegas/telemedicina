import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video, Volume2, VolumeX } from 'lucide-react';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { notificationService } from '../../lib/api/notifications';

// URL de un tono de llamada estándar más fiable (sin bloqueos de Pixabay)
const RINGTONE_URL = 'https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3';

export const IncomingCallOverlay: React.FC = () => {
    const { incomingCall, setIncomingCall, refreshCount } = useNotificationsContext();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioError, setAudioError] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (incomingCall) {
            setAudioError(false);
            if (audioRef.current) {
                audioRef.current.play().catch(e => {
                    console.warn("Audio autoplay blocked or failed:", e);
                    setAudioError(true);
                });
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setAudioError(false);
        }
    }, [incomingCall]);

    if (!incomingCall) return null;

    const { doctor_name, appointment_id } = incomingCall.data || {};

    const handleAnswer = async () => {
        try {
            await notificationService.markAsRead(incomingCall.id);
            refreshCount();
            setIncomingCall(null);
            navigate(`/dashboard/patient/appointments/${appointment_id}/video`);
        } catch (error) {
            console.error("Error answering call:", error);
        }
    };

    const handleDecline = async () => {
        try {
            await notificationService.markAsRead(incomingCall.id);
            refreshCount();
            setIncomingCall(null);
        } catch (error) {
            console.error("Error declining call:", error);
        }
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioError || audioRef.current.paused) {
                audioRef.current.play()
                    .then(() => setAudioError(false))
                    .catch(() => setAudioError(true));
            } else {
                audioRef.current.pause();
            }
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-700">
            <audio 
                ref={audioRef} 
                src={RINGTONE_URL} 
                loop 
            />
            
            <div className="relative max-w-sm w-full mx-4 p-8 text-center space-y-10">
                {/* Visual pulse effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative space-y-6">
                    <div className="relative mx-auto w-36 h-36">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                        <div className="absolute -inset-4 bg-blue-400/10 rounded-full animate-pulse blur-md" />
                        <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-full w-full h-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] border-2 border-white/20">
                            <Video className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                            {doctor_name || 'Médico Especialista'}
                        </h2>
                        <div className="flex flex-col items-center gap-2">
                            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-blue-500/30">
                                Videollamada entrante
                            </span>
                            
                            {audioError && (
                                <button 
                                    onClick={toggleAudio}
                                    className="flex items-center gap-2 text-amber-400 text-xs font-bold animate-bounce mt-2 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20"
                                >
                                    <VolumeX className="w-4 h-4" />
                                    EL NAVEGADOR BLOQUEÓ EL SONIDO. HAZ CLIC AQUÍ.
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-12 relative z-10 pt-4">
                    <button 
                        onClick={handleDecline}
                        className="group flex flex-col items-center gap-3 transition-all hover:scale-110 active:scale-90"
                    >
                        <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all bg-blur-sm">
                            <PhoneOff className="w-6 h-6 text-rose-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Rechazar</span>
                    </button>

                    <button 
                        onClick={handleAnswer}
                        className="group flex flex-col items-center gap-3 transition-all hover:scale-110 active:scale-95"
                    >
                        <div className="w-24 h-24 bg-emerald-500 border-4 border-emerald-400/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all animate-pulse hover:animate-none">
                            <Phone className="w-10 h-10 text-white" />
                        </div>
                        <span className="text-white font-black uppercase tracking-[0.2em] text-[11px] group-hover:text-emerald-400 transition-colors">Contestar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
