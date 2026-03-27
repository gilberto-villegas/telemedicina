import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [headerSolid, setHeaderSolid] = useState(!transparent);

  useEffect(() => {
    if (!transparent) return;
    
    const handleScroll = () => {
      setHeaderSolid(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${headerSolid ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group cursor-pointer">
          <div className={`p-2.5 rounded-2xl transition-all duration-500 shadow-2xl ${headerSolid ? 'bg-blue-600 shadow-blue-500/20' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
            <img 
              src="/assets/branding/logo.png" 
              alt="VilSalud" 
              className={`h-7 w-7 object-contain transition-all duration-500 ${headerSolid ? 'invert brightness-0' : ''}`} 
              style={headerSolid ? { filter: 'brightness(0) invert(1)' } : {}} 
            />
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl font-black tracking-tighter transition-colors duration-500 ${headerSolid ? 'text-slate-900' : 'text-white'}`}>
              VilSalud
            </span>
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-opacity duration-500 ${headerSolid ? 'text-blue-600' : 'text-blue-300 opacity-80'}`}>
              Salud Digital
            </span>
          </div>
        </Link>
        {/* Navbar mantenido 100% minimalista sin botones de acción */}
      </div>
    </header>
  );
}
