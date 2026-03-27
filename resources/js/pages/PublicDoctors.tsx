import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api } from '@/lib/api';
import { 
  Stethoscope, Star, Search, Filter, 
  ArrowRight, MapPin, Award, 
  CheckCircle2, Clock
} from 'lucide-react';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  specialty_id: string;
  rating: number | null;
  consultation_price_usd: number;
  is_verified: boolean;
  avatar_url?: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

export default function PublicDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  
  // Filters from URL or local state
  const querySpecialty = searchParams.get('specialty') || '';
  const [activeSpecialty, setActiveSpecialty] = useState(querySpecialty);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSpecialties();
    loadDoctors(1, querySpecialty);
  }, [querySpecialty]);

  const loadSpecialties = async () => {
    try {
      const res = await api.get('/specialties');
      setSpecialties(res.data);
    } catch (err) {
      console.error('Error loading specialties:', err);
    }
  };

  const loadDoctors = async (page: number, specialty: string = '', append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      
      const res = await api.get('/public/doctors', {
        params: {
          page,
          specialty: specialty || undefined,
          search: searchTerm || undefined,
          per_page: 12
        }
      });
      
      if (append) {
        setDoctors(prev => [...prev, ...res.data.data]);
      } else {
        setDoctors(res.data.data);
      }
      
      setMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total
      });
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDoctors(1, activeSpecialty);
  };

  const handleSpecialtyChange = (specName: string) => {
    const newVal = specName === activeSpecialty ? '' : specName;
    setActiveSpecialty(newVal);
    setSearchParams(newVal ? { specialty: newVal } : {});
  };

  return (
    <PublicLayout>
      {/* ─── HERO HEADER ─── */}
      <section className="relative pt-40 pb-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block animate-fade-in">Directorio Médico Elite</span>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 animate-fade-in-up">
            Encuentra a tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Especialista Ideal</span>
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 animate-fade-in-up delay-200">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o palabra clave..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-14 pr-6 rounded-3xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 font-medium"
              />
            </div>
            <button type="submit" className="h-16 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              BUSCAR AHORA
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-80 shrink-0 space-y-10">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Especialidades</h3>
              </div>
              
              <div className="space-y-2">
                {specialties.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => handleSpecialtyChange(spec.name)}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group ${activeSpecialty === spec.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'}`}
                  >
                    {spec.name}
                    <ChevronRight className={`h-4 w-4 transition-transform ${activeSpecialty === spec.name ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                <h4 className="font-black text-xl mb-4 leading-tight">¿Deseas unirte a nuestra red médica?</h4>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed font-medium">Digitaliza tu consulta y llega a miles de pacientes en todo el mundo.</p>
                <Link to="/auth/register?type=medico">
                  <button className="w-full py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest shadow-xl">
                    Registrarme como Médico
                  </button>
                </Link>
               </div>
               <Stethoscope className="absolute -bottom-10 -right-10 h-40 w-40 text-blue-400/20 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </aside>

          {/* Doctors Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeSpecialty ? (
                  <>Especialistas en <span className="text-blue-600">{activeSpecialty}</span></>
                ) : (
                  'Todos los Especialistas'
                )}
                <span className="ml-4 text-xs font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest tabular-nums">
                  {meta?.total || 0} Resultados
                </span>
              </h2>
            </div>

            {loading && doctors.length === 0 ? (
               <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-slate-100 rounded-[2.5rem] h-96 animate-pulse" />
                ))}
               </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No encontramos coincidencias</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-10">Intenta ajustar tus filtros o buscar una especialidad diferente.</p>
                <button onClick={() => { setActiveSpecialty(''); loadDoctors(1, ''); }} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Ver todos los médicos
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                    {/* Header Image */}
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      {doctor.avatar_url ? (
                        <img src={doctor.avatar_url} alt={`Dr. ${doctor.last_name}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Stethoscope className="h-16 w-16 text-slate-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      {doctor.is_verified && (
                        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verificado</span>
                        </div>
                      )}
                    </div>

                    <div className="p-10 flex-col flex-1">
                      <div className="mb-8">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 block">{doctor.specialty}</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                          Dr. {doctor.first_name} <br />
                          {doctor.last_name}
                        </h3>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                             <span className="font-black text-slate-900 text-sm">{doctor.rating || '4.9'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                             <Clock className="h-4 w-4" />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Hoy Disponible</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio Online</p>
                          <p className="text-2xl font-black text-blue-600 tabular-nums">${doctor.consultation_price_usd}</p>
                        </div>
                        <Link to={`/auth/register?type=patient`} className="flex-1">
                          <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/40 group/btn flex items-center justify-center gap-2">
                            AGENDAR
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination / Load More */}
            {meta && meta.current_page < meta.last_page && (
              <div className="mt-20 text-center">
                <button 
                  onClick={() => loadDoctors(meta.current_page + 1, activeSpecialty, true)}
                  disabled={loadingMore}
                  className="px-12 py-5 bg-white border border-slate-200 text-slate-900 font-black rounded-[2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mx-auto shadow-sm hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? 'CARGANDO ESPECIALISTAS...' : 'CARGAR MÁS MÉDICOS'}
                  {!loadingMore && <ArrowRight className="h-5 w-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER / CONTACT ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center">
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-8 rotate-3 shadow-2xl">
                   <Award className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tighter max-w-2xl leading-tight">
                  Calidad Médica Internacional al Alcance de tu <span className="text-blue-400">Presupuesto</span>
                </h2>
                <p className="text-slate-400 max-w-xl mb-12 font-medium text-lg leading-relaxed">
                  Todos nuestros especialistas han pasado por un riguroso proceso de validación por el Ministerio de Salud y nuestro comité médico.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                   {[
                     { icon: CheckCircle2, text: 'Verificados' },
                     { icon: MapPin, text: 'En todo el país' },
                     { icon: Stethoscope, text: '30+ Especialidades' }
                   ].map(item => (
                     <div key={item.text} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-blue-500" />
                        {item.text}
                     </div>
                   ))}
                </div>
             </div>
             
             {/* Background glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Helper icons
function ChevronRight(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
