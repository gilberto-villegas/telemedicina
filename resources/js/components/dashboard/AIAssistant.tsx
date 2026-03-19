import { useState, useEffect, useRef } from 'react';
import { X, Play, MessageCircle, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string;
  title: string;
  content: string;
  audioText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'dashboard-main',
    title: 'Bienvenido a tu Panel',
    content: 'Aquí puedes ver un resumen de su salud, próximas citas y recordatorios importantes de forma rápida.',
    audioText: '¡Hola! Bienvenido a tu panel principal de telemedicina. Aquí encontrarás un resumen de todo lo que necesitas para cuidar tu salud con un diseño premium y fácil de usar.'
  },
  {
    target: 'nav-doctors',
    title: 'Busca a tu Especialista',
    content: 'Encuentra médicos por especialidad revisando perfiles reales y agende su cita en segundos.',
    audioText: '¿Necesitas un médico? En la sección de Buscar Médicos podrás encontrar a los mejores especialistas, ver sus fotos y especialidades, y agendar una cita de forma sencilla.'
  },
  {
    target: 'nav-appointments',
    title: 'Gestiona tus Citas',
    content: 'Revise sus citas programadas, únase a videollamadas o vea el historial de sus consultas pasadas.',
    audioText: 'En el menú de Mis Citas puedes ver cuándo es tu próximo encuentro médico, unirte a la videollamada directamente o revisar lo que se habló en consultas anteriores.'
  },
  {
    target: 'nav-medical-records',
    title: 'Tu Historial Clínico',
    content: 'Acceda a sus informes médicos, diagnósticos y evolución clínica en cualquier momento.',
    audioText: 'Tu historial clínico está siempre a tu disposición y es totalmente privado. Aquí puedes revisar tus diagnósticos y seguir tu evolución médica.'
  },
  {
    target: 'nav-prescriptions',
    title: 'Recetas Digitales',
    content: 'Descargue e imprima las recetas emitidas por sus doctores con firma digital certificada.',
    audioText: 'Si el doctor te receta algún medicamento, aparecerá mágicamente en esta sección de Recetas. Tienen validez legal y puedes descargarlas para la farmacia.'
  },
  {
    target: 'nav-payments',
    title: 'Pagos y Facturación',
    content: 'Gestione sus pagos mediante Zelle o Pago Móvil y mantenga al día sus servicios de salud.',
    audioText: 'Finalmente, en la sección de Pagos puedes gestionar tus transacciones de forma segura y transparente.'
  }
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Precargar voces
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string) => {
    // Stop any current speech regardless of mute state
    window.speechSynthesis.cancel();
    
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1.1; // Un poco más agudo para sonar más femenino
    
    // Buscar voz femenina en español
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.lang.includes('es') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('mujer') || 
       v.name.toLowerCase().includes('google español') ||
       v.name.toLowerCase().includes('helena') ||
       v.name.toLowerCase().includes('laura'))
    );
    
    if (femaleVoice) utterance.voice = femaleVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
    // Pequeño delay para que el panel se abra antes de hablar
    setTimeout(() => {
      speak(TOUR_STEPS[0].audioText);
    }, 300);
  };

  const nextStep = () => {
    if (currentStep !== null && currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      speak(TOUR_STEPS[next].audioText);
    } else {
      closeAssistant();
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
    setCurrentStep(null);
    window.speechSynthesis.cancel();
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      window.speechSynthesis.cancel();
    } else if (currentStep !== null) {
      speak(TOUR_STEPS[currentStep].audioText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {/* Chat Bubble / Panel */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Guía de Salud IA</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
                title={isMuted ? "Activar voz" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />}
              </button>
              <button 
                onClick={closeAssistant}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {currentStep !== null ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    Paso {currentStep + 1} de {TOUR_STEPS.length}
                  </div>
                  {isSpeaking && (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: '0.5s' }} />
                      <div className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: '0.7s' }} />
                      <div className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: '0.4s' }} />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 leading-tight">{TOUR_STEPS[currentStep].title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {TOUR_STEPS[currentStep].content}
                </p>
                <div className="flex gap-2 pt-2">
                   <Button 
                    onClick={nextStep}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 transition-all active:scale-95"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? '¡Entendido!' : 'Siguiente'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="relative w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-2 overflow-hidden border border-blue-100/50">
                  <Play className="h-8 w-8 text-blue-600 fill-blue-500/20" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent" />
                </div>
                <h4 className="font-bold text-slate-800">¿Necesitas ayuda hoy?</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hola, soy tu guía personal. Puedo explicarte cómo sacar el máximo provecho a tu portal de salud.
                </p>
                <Button 
                  onClick={startTour}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Iniciar Tour Guiado
                </Button>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asistente Virtual IA • Español</p>
          </div>
        </div>
      )}

      {/* Trigger Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto group relative w-16 h-16 rounded-3xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 hover:shadow-[0_15px_50px_-10px_rgba(59,130,246,0.3)] ${isOpen ? 'ring-4 ring-blue-500/20' : ''}`}
      >
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full animate-pulse shadow-sm z-10" />
        <div className="w-full h-full p-0.5 rounded-3xl overflow-hidden">
          <img 
            src="/assets/images/assistant.png" 
            alt="AI Assistant" 
            className="w-full h-full object-cover rounded-[1.3rem]"
          />
        </div>
        
        {/* Tooltip hint */}
        {!isOpen && (
          <div className="absolute right-24 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl border border-white/10 translate-x-4 group-hover:translate-x-0">
            ¿Necesitas ayuda?
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
          </div>
        )}

        {/* Pulsing ring when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-3xl border-2 border-blue-400 animate-ping opacity-20" />
        )}
      </button>
    </div>
  );
}
