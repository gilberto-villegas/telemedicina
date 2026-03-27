import React from 'react';
import { Navbar } from './Navbar';

interface PublicLayoutProps {
  children: React.ReactNode;
  transparentNavbar?: boolean;
}

export function PublicLayout({ children, transparentNavbar = false }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar transparent={transparentNavbar} />
      <main>
        {children}
      </main>
      
      {/* Footer Minimalista */}
      <footer className="bg-slate-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-xl">
              <img src="/assets/branding/logo.png" alt="VilSalud" className="h-6 w-6 invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">VilSalud</span>
          </div>
          <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium">
            La plataforma de salud digital que está transformando el acceso médico en Venezuela y el mundo.
          </p>
          <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] py-8 border-t border-white/5">
            © {new Date().getFullYear()} VilSalud. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
