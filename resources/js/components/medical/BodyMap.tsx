import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface BodyMapProps {
  selectedParts: string[];
  onSelectPart?: (partId: string) => void;
  readOnly?: boolean;
}

export function BodyMap({ selectedParts, onSelectPart, readOnly }: BodyMapProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getPathClass = (partId: string) => {
    const isSelected = selectedParts.includes(partId);
    const isHovered = hoveredPart === partId;
    return cn(
      "transition-all duration-300 cursor-pointer outline-none",
      isSelected 
        ? "fill-primary/40 stroke-primary stroke-[2] filter drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" 
        : isHovered && !readOnly
            ? "fill-primary/20 stroke-primary stroke-[1]"
            : "fill-transparent stroke-transparent hover:fill-primary/10 hover:stroke-primary/30"
    );
  };

  const handleMouseEnter = (partId: string) => {
    if (!readOnly) setHoveredPart(partId);
  };
  
  const handleMouseLeave = () => setHoveredPart(null);

  return (
    <div className="relative w-full max-w-sm mx-auto p-8 rounded-[2.5rem] bg-gradient-to-b from-slate-50 to-white border border-slate-100 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
      
      {/* Premium Header/Hint */}
      <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Sparkles className="h-3 w-3 text-primary" />
          Modelo Anatómico Interactivo
        </div>
      </div>

      <div className="relative mt-8 group/map">
        {/* The 3D Model image as background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 transition-opacity group-hover/map:opacity-100">
           <img 
             src="/images/medical/body-map-3d.png" 
             className="w-full h-full object-contain filter brightness-105 contrast-105"
             alt="3D Anatomic Model"
           />
        </div>

        {/* Glow effect strictly behind the SVGs */}
        <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <svg 
          viewBox="0 0 400 500" 
          className="w-full h-auto z-10 relative pointer-events-auto"
        >
          {/* FRENTE */}
          <g transform="translate(50, 20)">
            <text x="50" y="-5" textAnchor="middle" className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400">Frente</text>
            
            {/* Cabeza */}
            <path
              d="M35 15 C35 5, 65 5, 65 15 C65 30, 60 40, 50 45 C40 40, 35 30, 35 15 Z"
              className={getPathClass('Cabeza Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Cabeza Frontal')}
              onMouseEnter={() => handleMouseEnter('Cabeza Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Cuello */}
            <path
              d="M40 45 L60 45 L65 60 L35 60 Z"
              className={getPathClass('Cuello Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Cuello Frontal')}
              onMouseEnter={() => handleMouseEnter('Cuello Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pecho */}
            <path
              d="M35 60 L65 60 L80 120 L20 120 Z"
              className={getPathClass('Pecho')}
              onClick={() => !readOnly && onSelectPart?.('Pecho')}
              onMouseEnter={() => handleMouseEnter('Pecho')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Abdomen */}
            <path
              d="M20 120 L80 120 L75 180 L25 180 Z"
              className={getPathClass('Abdomen')}
              onClick={() => !readOnly && onSelectPart?.('Abdomen')}
              onMouseEnter={() => handleMouseEnter('Abdomen')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pelvis */}
            <path
              d="M25 180 L75 180 L70 210 L50 220 L30 210 Z"
              className={getPathClass('Pelvis Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Pelvis Frontal')}
              onMouseEnter={() => handleMouseEnter('Pelvis Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Brazo Izquierdo */}
            <path
              d="M80 60 L95 65 L90 140 L75 130 Z"
              className={getPathClass('Brazo Izquierdo')}
              onClick={() => !readOnly && onSelectPart?.('Brazo Izquierdo')}
              onMouseEnter={() => handleMouseEnter('Brazo Izquierdo')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Antebrazo Izquierdo */}
            <path
              d="M90 140 L95 200 L80 195 L75 130 Z"
              className={getPathClass('Antebrazo Izquierdo')}
              onClick={() => !readOnly && onSelectPart?.('Antebrazo Izquierdo')}
              onMouseEnter={() => handleMouseEnter('Antebrazo Izquierdo')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Mano Izquierda */}
            <path
              d="M80 195 L95 200 L95 230 L80 225 Z"
              className={getPathClass('Mano Izquierda')}
              onClick={() => !readOnly && onSelectPart?.('Mano Izquierda')}
              onMouseEnter={() => handleMouseEnter('Mano Izquierda')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Brazo Derecho */}
            <path
              d="M20 60 L5 65 L10 140 L25 130 Z"
              className={getPathClass('Brazo Derecho')}
              onClick={() => !readOnly && onSelectPart?.('Brazo Derecho')}
              onMouseEnter={() => handleMouseEnter('Brazo Derecho')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Antebrazo Derecho */}
            <path
              d="M10 140 L5 200 L20 195 L25 130 Z"
              className={getPathClass('Antebrazo Derecho')}
              onClick={() => !readOnly && onSelectPart?.('Antebrazo Derecho')}
              onMouseEnter={() => handleMouseEnter('Antebrazo Derecho')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Mano Derecho */}
            <path
              d="M20 195 L5 200 L5 230 L20 225 Z"
              className={getPathClass('Mano Derecha')}
              onClick={() => !readOnly && onSelectPart?.('Mano Derecha')}
              onMouseEnter={() => handleMouseEnter('Mano Derecha')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pierna Izquierda (Superior) */}
            <path
              d="M50 220 L70 210 L65 300 L50 300 Z"
              className={getPathClass('Muslo Izquierdo Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Muslo Izquierdo Frontal')}
              onMouseEnter={() => handleMouseEnter('Muslo Izquierdo Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pierna Izquierda (Inferior) */}
            <path
              d="M50 300 L65 300 L60 400 L50 400 Z"
              className={getPathClass('Pierna Izquierda Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Pierna Izquierda Frontal')}
              onMouseEnter={() => handleMouseEnter('Pierna Izquierda Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 400 L60 400 L65 420 L45 420 Z"
              className={getPathClass('Pie Izquierdo')}
              onClick={() => !readOnly && onSelectPart?.('Pie Izquierdo')}
              onMouseEnter={() => handleMouseEnter('Pie Izquierdo')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pierna Derecha (Superior) */}
            <path
              d="M50 220 L30 210 L35 300 L50 300 Z"
              className={getPathClass('Muslo Derecho Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Muslo Derecho Frontal')}
              onMouseEnter={() => handleMouseEnter('Muslo Derecho Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pierna Derecha (Inferior) */}
            <path
              d="M50 300 L35 300 L40 400 L50 400 Z"
              className={getPathClass('Pierna Derecha Frontal')}
              onClick={() => !readOnly && onSelectPart?.('Pierna Derecha Frontal')}
              onMouseEnter={() => handleMouseEnter('Pierna Derecha Frontal')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 400 L40 400 L35 420 L55 420 Z"
              className={getPathClass('Pie Derecho')}
              onClick={() => !readOnly && onSelectPart?.('Pie Derecho')}
              onMouseEnter={() => handleMouseEnter('Pie Derecho')}
              onMouseLeave={handleMouseLeave}
            />
          </g>

          {/* ESPALDA */}
          <g transform="translate(250, 20)">
            <text x="50" y="-5" textAnchor="middle" className="text-[10px] font-black uppercase tracking-[0.2em] fill-slate-400">Espalda</text>
            
            {/* Cabeza Posterior */}
            <path
              d="M35 15 C35 5, 65 5, 65 15 C65 30, 60 40, 50 45 C40 40, 35 30, 35 15 Z"
              className={getPathClass('Cabeza Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Cabeza Posterior')}
              onMouseEnter={() => handleMouseEnter('Cabeza Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Cuello Posterior */}
            <path
              d="M40 45 L60 45 L65 60 L35 60 Z"
              className={getPathClass('Nuca')}
              onClick={() => !readOnly && onSelectPart?.('Nuca')}
              onMouseEnter={() => handleMouseEnter('Nuca')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Espalda Alta */}
            <path
              d="M35 60 L65 60 L75 110 L25 110 Z"
              className={getPathClass('Espalda Alta')}
              onClick={() => !readOnly && onSelectPart?.('Espalda Alta')}
              onMouseEnter={() => handleMouseEnter('Espalda Alta')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Espalda Baja */}
            <path
              d="M25 110 L75 110 L70 160 L30 160 Z"
              className={getPathClass('Espalda Baja')}
              onClick={() => !readOnly && onSelectPart?.('Espalda Baja')}
              onMouseEnter={() => handleMouseEnter('Espalda Baja')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Glúteos */}
            <path
              d="M30 160 L70 160 L75 210 L50 220 L25 210 Z"
              className={getPathClass('Glúteos')}
              onClick={() => !readOnly && onSelectPart?.('Glúteos')}
              onMouseEnter={() => handleMouseEnter('Glúteos')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Brazo Izquierdo (Vista Posterior) */}
            <path
              d="M25 60 L10 65 L15 140 L30 130 Z"
              className={getPathClass('Brazo Izquierdo Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Brazo Izquierdo Posterior')}
              onMouseEnter={() => handleMouseEnter('Brazo Izquierdo Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M15 140 L10 200 L25 195 L30 130 Z"
              className={getPathClass('Antebrazo Izquierdo Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Antebrazo Izquierdo Posterior')}
              onMouseEnter={() => handleMouseEnter('Antebrazo Izquierdo Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M25 195 L10 200 L10 230 L25 225 Z"
              className={getPathClass('Mano Izquierda Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Mano Izquierda Posterior')}
              onMouseEnter={() => handleMouseEnter('Mano Izquierda Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Brazo Derecho (Vista Posterior) */}
            <path
              d="M75 60 L90 65 L85 140 L70 130 Z"
              className={getPathClass('Brazo Derecho Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Brazo Derecho Posterior')}
              onMouseEnter={() => handleMouseEnter('Brazo Derecho Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M85 140 L90 200 L75 195 L70 130 Z"
              className={getPathClass('Antebrazo Derecho Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Antebrazo Derecho Posterior')}
              onMouseEnter={() => handleMouseEnter('Antebrazo Derecho Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M75 195 L90 200 L90 230 L75 225 Z"
              className={getPathClass('Mano Derecha Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Mano Derecha Posterior')}
              onMouseEnter={() => handleMouseEnter('Mano Derecha Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            {/* Pierna Izquierda Posterior */}
            <path
              d="M50 220 L25 210 L35 300 L50 300 Z"
              className={getPathClass('Muslo Izquierdo Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Muslo Izquierdo Posterior')}
              onMouseEnter={() => handleMouseEnter('Muslo Izquierdo Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 300 L35 300 L40 400 L50 400 Z"
              className={getPathClass('Pantorrilla Izquierda')}
              onClick={() => !readOnly && onSelectPart?.('Pantorrilla Izquierda')}
              onMouseEnter={() => handleMouseEnter('Pantorrilla Izquierda')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 400 L40 400 L35 420 L55 420 Z"
              className={getPathClass('Talón Izquierdo')}
              onClick={() => !readOnly && onSelectPart?.('Talón Izquierdo')}
              onMouseEnter={() => handleMouseEnter('Talón Izquierdo')}
              onMouseLeave={handleMouseLeave}
            />

            {/* Pierna Derecha Posterior */}
            <path
              d="M50 220 L75 210 L65 300 L50 300 Z"
              className={getPathClass('Muslo Derecho Posterior')}
              onClick={() => !readOnly && onSelectPart?.('Muslo Derecho Posterior')}
              onMouseEnter={() => handleMouseEnter('Muslo Derecho Posterior')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 300 L65 300 L60 400 L50 400 Z"
              className={getPathClass('Pantorrilla Derecha')}
              onClick={() => !readOnly && onSelectPart?.('Pantorrilla Derecha')}
              onMouseEnter={() => handleMouseEnter('Pantorrilla Derecha')}
              onMouseLeave={handleMouseLeave}
            />
            <path
              d="M50 400 L60 400 L65 420 L45 420 Z"
              className={getPathClass('Talón Derecho')}
              onClick={() => !readOnly && onSelectPart?.('Talón Derecho')}
              onMouseEnter={() => handleMouseEnter('Talón Derecho')}
              onMouseLeave={handleMouseLeave}
            />
          </g>

          {/* Glow Definitions */}
          <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
          </defs>
        </svg>
      </div>

      {hoveredPart && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200 z-20">
           <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             {hoveredPart}
           </div>
        </div>
      )}
    </div>
  );
}
