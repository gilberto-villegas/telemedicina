import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import {
  Stethoscope, Video, FileText, CreditCard, Shield, Clock,
  Heart, Brain, Baby, Eye, Bone, Microscope,
  CheckCircle, Star, ChevronRight, Phone, MessageCircle,
  Users, Calendar, Award, ArrowRight, Zap, Globe
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';

/* ---- Animated counter hook ---- */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, setStarted };
}

/* ---- Intersection observer hook ---- */
function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ---- Stat card ---- */
function StatCard({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const { ref, visible } = useVisible();
  const { count, setStarted } = useCountUp(value);
  useEffect(() => { if (visible) setStarted(true); }, [visible]);

  return (
    <div ref={ref} className={`text-center p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="text-5xl font-black text-white mb-3 tracking-tighter tabular-nums">{count.toLocaleString()}{suffix}</div>
      <div className="text-blue-200 text-[10px] font-black tracking-[0.2em] uppercase">{label}</div>
    </div>
  );
}

/* ---- Specialties ---- */
const specialties = [
  { icon: Heart,       label: 'Cardiología',       name: 'Cardiologia',       color: 'bg-rose-50 text-rose-600',    desc: 'Atención especializada para tu salud cardiovascular' },
  { icon: Brain,       label: 'Neurología',         name: 'Neurologia',        color: 'bg-violet-50 text-violet-600', desc: 'Diagnóstico experto del sistema nervioso' },
  { icon: Baby,        label: 'Pediatría',          name: 'Pediatria',         color: 'bg-orange-50 text-orange-600',  desc: 'Cuidado integral para los más pequeños' },
  { icon: Eye,         label: 'Oftalmología',       name: 'Oftalmologia',      color: 'bg-cyan-50 text-cyan-600',     desc: 'Salud visual con tecnología de vanguardia' },
  { icon: Bone,        label: 'Traumatología',      name: 'Traumatologia',     color: 'bg-emerald-50 text-emerald-600', desc: 'Recuperación de huesos y articulaciones' },
  { icon: Microscope,  label: 'Med. General',       name: 'Medicina General',  color: 'bg-blue-50 text-blue-600',   desc: 'Tu primera línea de defensa en salud' },
  { icon: Stethoscope, label: 'Medicina Interna',   name: 'Medicina Interna',  color: 'bg-sky-50 text-sky-600',      desc: 'Gestión clínica integral del adulto' },
  { icon: Shield,      label: 'Dermatología',       name: 'Dermatologia',      color: 'bg-pink-50 text-pink-600',  desc: 'Protección y cuidado avanzado de tu piel' },
];

/* ---- Steps ---- */
const steps = [
  { num: '01', icon: Users,     title: 'Crea tu cuenta',         desc: 'Regístrate en minutos. Solo necesitas tu email. Proceso 100% digital y seguro.' },
  { num: '02', icon: Calendar,  title: 'Elige tu médico',        desc: 'Navega entre especialistas certificados. Filtra por especialidad y horario disponible.' },
  { num: '03', icon: Video,     title: 'Consulta en video',      desc: 'Conéctate desde cualquier dispositivo. Calidad HD optimizada para conexiones lentas.' },
  { num: '04', icon: FileText,  title: 'Recibe tu diagnóstico',  desc: 'El médico emite tu receta y plan de tratamiento digital al instante.' },
];

/* ---- Testimonials ---- */
const testimonials = [
  { name: 'María González',      role: 'Paciente',   text: 'Increíble plataforma. Pude consultar con un cardiólogo desde Maracaibo sin moverme de casa. La calidad del video es perfecta.',   stars: 5 },
  { name: 'Dr. Carlos Pérez',    role: 'Médico',      text: 'Como médico, la plataforma me permite gestionar mi agenda y mis pacientes de forma muy eficiente. El sistema de pagos es excelente.', stars: 5 },
  { name: 'Ana Ramírez',         role: 'Paciente',    text: 'Mis hijos pudieron ver al pediatra sin tener que esperar horas. Rápido, cómodo y muy profesional. Lo recomiendo a todos.',          stars: 5 },
];

/* ============================
   MAIN HOME COMPONENT
   ============================ */
export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const heroRef = useRef<HTMLDivElement>(null);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialtyDoctors, setSpecialtyDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const openSpecialtyModal = async (specialtyName: string) => {
    setSelectedSpecialty(specialtyName);
    setIsModalOpen(true);
    setLoadingDoctors(true);
    try {
      const res = await api.get(`/public/doctors?specialty=${encodeURIComponent(specialtyName)}&per_page=50`);
      setSpecialtyDoctors(res.data.data || []);
    } catch (e) {
      console.error(e);
      setSpecialtyDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const user = authService.getUser();
      if (user) navigate(`/dashboard/${user.type}`);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── STICKY HEADER ─── */}
      <Navbar transparent={true} />

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="hero-gradient relative min-h-screen flex items-center overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-4 sm:px-6 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-blue text-blue-200 text-sm font-medium mb-6">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  VilSalud: Salud Digital en Venezuela
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                  Salud sin <br />
                  <span className="text-gradient">límites</span> ni<br />
                  distancias
                </h1>
              </div>
              <p className="animate-fade-in-up delay-200 text-xl text-blue-100 leading-relaxed max-w-xl">
                Consulta con los mejores médicos certificados de Venezuela desde la comodidad de tu hogar.
                Rápido, seguro y accesible para toda la familia.
              </p>
              <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register?type=patient">
                  <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300">
                    Soy Paciente
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/auth/login">
                  <button className="flex items-center gap-3 px-8 py-4 rounded-2xl glass text-white font-semibold text-lg hover:bg-white/30 transition-all duration-300">
                    <Phone className="h-5 w-5" />
                    Ya tengo cuenta
                  </button>
                </Link>
              </div>
              {/* Trust badges */}
              <div className="animate-fade-in-up delay-500 flex items-center gap-6 pt-4">
                {[
                  { icon: Shield,  text: '100% Seguro' },
                  { icon: Award,   text: 'MPPS Certificado' },
                  { icon: Globe,   text: 'En todo VE' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-blue-200 text-sm">
                    <Icon className="h-4 w-4 text-blue-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right image - The Mockup */}
            <div className="relative animate-fade-in-up delay-200 hidden lg:block">
              <div className="relative z-10 p-4 bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 shadow-2xl animate-float">
                <img
                  src="/assets/images/vilsalud_videoconsulta_mockup.png"
                  alt="Doctor en videollamada VilSalud"
                  className="w-full max-w-xl mx-auto rounded-[2rem] shadow-black/50 shadow-2xl object-cover hover:scale-[1.02] transition-transform duration-700"
                />
                
                {/* Floating Elements */}
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 glass rounded-[1.5rem] p-6 shadow-2xl animate-pulse-slow">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">En Vivo</p>
                      <p className="text-sm font-bold text-white">Consulta Activa</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-8 left-12 glass rounded-[1.5rem] p-6 shadow-2xl animate-float delay-700">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">+12k Pacientes</p>
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Confían en nosotros</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow Behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/30 rounded-full blur-[120px] -z-10" />
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 0 960 60 720 40C480 20 240 60 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value={12000}  label="Pacientes Atendidos"     suffix="+" />
            <StatCard value={350}    label="Médicos Certificados"    suffix="+" />
            <StatCard value={98}     label="% Satisfacción"         suffix="%" />
            <StatCard value={24}     label="Horas de Atención"      suffix="/7" />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Proceso Simple</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-2">
              Consulta en <span className="text-gradient">4 pasos</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Desde el registro hasta recibir tu diagnóstico, todo toma menos de 10 minutos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-px bg-slate-200 z-0" />
            {steps.map(({ num, icon: Icon, title, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={num}
                  ref={ref}
                  className={`relative z-10 text-center animate-fade-in-up group ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Icon className="h-8 w-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-[10px] font-black text-indigo-600 border border-slate-100 italic">
                        {num}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium px-4">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PATIENT EXPERIENCE IMAGE ─── */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/patient-experience.png"
                alt="Paciente usando VilSalud"
                className="rounded-3xl shadow-2xl w-full object-cover hover-lift"
              />
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Tu salud, primero</span>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-2 leading-tight">
                  Atención médica<br />desde donde<br /><span className="text-gradient">estés</span>
                </h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Ya no necesitas viajar horas para ver a un especialista. Con nuestra plataforma,
                accedes a los mejores médicos de Venezuela sin importar en qué ciudad vivas.
              </p>
              <div className="space-y-4">
                {[
                  'Consultas disponibles todos los días, incluyendo fines de semana',
                  'Recetas digitales y historial clínico en tu bolsillo',
                  'Pagos en Bolívares, dólares y Pago Móvil',
                  'Videollamadas HD optimizadas para conexión lenta',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth/register?type=patient">
                <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
                  Comenzar Ahora
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPECIALTIES ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Especialidades</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-2">
              Todas las <span className="text-gradient">especialidades</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Contamos con más de 30 especialidades médicas atendidas por profesionales certificados.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map(({ icon: Icon, label, name, color, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={label}
                  ref={ref}
                  className={`bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 animate-fade-in-up group cursor-pointer ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  onClick={() => openSpecialtyModal(name)}
                >
                  <div className={`w-14 h-14 rounded-2xl ${color.split(' ')[0]} ${color.split(' ')[1]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">{label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
                  
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center text-indigo-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Consultar ahora <ChevronRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES BANNER ─── */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Abstract shapes for tech feel */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em]">Características Elite</span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
              Tecnología Médica de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-black">Nivel Global</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Video,       title: 'Videollamadas HD+',         desc: 'Protocolos de video optimizados para baja latencia en redes móviles.' },
              { icon: FileText,    title: 'E-Health Records',          desc: 'Tu historial médico encriptado siguiendo estándares internacionales.' },
              { icon: CreditCard,  title: 'Fintech Health',            desc: 'Pagos integrados con soporte multi-moneda local e internacional.' },
              { icon: Clock,       title: 'Smart Scheduling',          desc: 'Algoritmos de agenda que eliminan los tiempos de espera.' },
              { icon: Shield,      title: 'Privacidad Bancaria',       desc: 'Tus datos clínicos protegidos con encriptación AES-256 de grado militar.' },
              { icon: MessageCircle, title: 'Medical Concierge',       desc: 'Canal directo de comunicación con tus médicos para seguimiento.' },
            ].map(({ icon: Icon, title, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={title}
                  ref={ref}
                  className={`p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 group animate-fade-in-up ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.3em]">Testimonios Reales</span>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mt-4 tracking-tight leading-none">
                Confianza que <br />cruza <span className="text-indigo-600">fronteras</span>
              </h2>
            </div>
            <div className="flex gap-2">
              <div className="flex -space-x-4">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+40}`} className="w-14 h-14 rounded-full border-4 border-white shadow-lg" alt="User" />
                ))}
              </div>
              <div className="ml-4">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1">4.9/5 Calificación</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, text }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={name}
                  ref={ref}
                  className={`bg-slate-50 rounded-[2.5rem] p-10 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 animate-fade-in-up relative overflow-hidden group ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <MessageCircle className="absolute -top-4 -right-4 h-24 w-24 text-indigo-500/5 group-hover:scale-110 transition-transform" />
                  <p className="text-lg text-slate-600 leading-relaxed mb-10 font-medium relative z-10">"{text}"</p>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">{name}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse-slow" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9]">
              EL FUTURO DE LA SALUD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 animate-shimmer bg-[length:200%_auto]">COMIENZA AQUÍ</span>
            </h2>
            <p className="text-slate-400 text-xl lg:text-2xl mb-12 font-medium leading-relaxed">
              Únete a la red médica digital más avanzada de Venezuela. <br />
              Atención premium, sin esperas, sin fronteras.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/auth/register?type=patient">
                <button className="group relative px-12 py-6 bg-white text-slate-950 font-black text-xl rounded-[2rem] hover:scale-105 transition-all duration-500 shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    EMPEZA GRATIS AHORA
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 py-8 border-t border-white/5">
              {[
                { icon: Shield, text: 'Seguridad Militar' },
                { icon: Star, text: 'Calidad Premium' },
                { icon: Globe, text: 'Alcance Global' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Icon className="h-4 w-4 text-indigo-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <img src="/assets/branding/logo.png" alt="VilSalud" className="h-5 w-5 object-contain invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">VilSalud</span>
            </div>
            <p className="text-sm">© 2024 VilSalud. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── DOCTORS MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Especialistas en {selectedSpecialty}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Nuestros profesionales certificados listos para atenderte.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1">
              {loadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-slate-500 font-medium">Buscando especialistas...</p>
                </div>
              ) : specialtyDoctors.length === 0 ? (
                <div className="text-center py-20">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="h-10 w-10 text-slate-400" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">No hay médicos disponibles</h4>
                  <p className="text-slate-500">Actualmente no tenemos especialistas registrados en esta área.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specialtyDoctors.map(doc => (
                    <div key={doc.id} className="bg-white border text-center border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group">
                       <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 overflow-hidden mb-4 shadow-sm border-2 border-white group-hover:border-blue-100 transition-colors">
                          {doc.avatar_url ? (
                            <img src={doc.avatar_url} alt={`Dr. ${doc.last_name}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <Stethoscope className="h-10 w-10" />
                            </div>
                          )}
                       </div>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{doc.specialty}</span>
                       <h4 className="text-lg font-bold text-slate-900 line-clamp-1 truncate w-full">Dr. {doc.first_name} {doc.last_name}</h4>
                       
                       <div className="flex items-center gap-1 mt-2 mb-6 text-yellow-500">
                         {[1,2,3,4,5].map(j => (
                           <Star key={j} className={`h-4 w-4 ${j <= Math.round(doc.rating || 5) ? 'fill-current' : 'text-slate-200 fill-slate-200'}`} />
                         ))}
                       </div>

                       <Link to="/auth/login" className="w-full mt-auto">
                         <button className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-blue-600 shadow-md">
                           Visitar Médico
                         </button>
                       </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
