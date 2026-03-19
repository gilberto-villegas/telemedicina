import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import {
  Stethoscope, Video, FileText, CreditCard, Shield, Clock,
  Heart, Brain, Baby, Eye, Bone, Microscope,
  CheckCircle, Star, ChevronRight, Phone, MessageCircle,
  Users, Calendar, Award, ArrowRight, Zap, Globe
} from 'lucide-react';

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
    <div ref={ref} className={`text-center glass rounded-2xl p-8 hover-lift animate-fade-in-up ${visible ? '' : 'opacity-0'}`}>
      <div className="shimmer text-5xl font-extrabold mb-2">{count.toLocaleString()}{suffix}</div>
      <div className="text-blue-100 text-sm font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

/* ---- Specialties ---- */
const specialties = [
  { icon: Heart,       label: 'Cardiología',       color: 'from-rose-400 to-pink-600',     desc: 'Atención al corazón y sistema cardiovascular' },
  { icon: Brain,       label: 'Neurología',         color: 'from-violet-400 to-purple-600', desc: 'Diagnóstico del sistema nervioso' },
  { icon: Baby,        label: 'Pediatría',          color: 'from-amber-400 to-orange-500',  desc: 'Cuidado integral del niño y adolescente' },
  { icon: Eye,         label: 'Oftalmología',       color: 'from-cyan-400 to-teal-600',     desc: 'Salud visual y enfermedades oculares' },
  { icon: Bone,        label: 'Traumatología',      color: 'from-lime-400 to-green-600',    desc: 'Huesos, músculos y articulaciones' },
  { icon: Microscope,  label: 'Med. General',       color: 'from-blue-400 to-indigo-600',   desc: 'Consultas generales y preventivas' },
  { icon: Stethoscope, label: 'Medicina Interna',   color: 'from-sky-400 to-blue-600',      desc: 'Diagnóstico y tratamiento integral' },
  { icon: Shield,      label: 'Dermatología',       color: 'from-fuchsia-400 to-pink-600',  desc: 'Salud de la piel y sistema tegumentario' },
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
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const user = authService.getUser();
      if (user) navigate(`/dashboard/${user.type}`);
    }
  }, [isAuthenticated, navigate]);

  /* Sticky header opacity on scroll */
  useEffect(() => {
    const onScroll = () => setHeaderSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── STICKY HEADER ─── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerSolid ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl animate-pulse-glow">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${headerSolid ? 'text-blue-700' : 'text-white'}`}>
              Telemedicina <span className="text-blue-400">VE</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${headerSolid ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}>
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/auth/register">
              <button className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm shadow-lg hover:shadow-blue-400/40 transition-all duration-200">
                Regístrate Gratis
              </button>
            </Link>
          </div>
        </div>
      </header>

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
                  Plataforma #1 de Venezuela
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

            {/* Right image */}
            <div className="relative animate-fade-in-up delay-200 hidden lg:block">
              <div className="animate-float">
                <img
                  src="/images/hero-bg.png"
                  alt="Doctor en videollamada"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl animate-float delay-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Videollamada activa</p>
                    <p className="text-sm font-bold text-gray-800">Dr. Rodríguez</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-xl animate-float delay-500">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-800">4.98</span>
                  <span className="text-xs text-gray-500">promedio</span>
                </div>
              </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 z-0" />
            {steps.map(({ num, icon: Icon, title, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={num}
                  ref={ref}
                  className={`relative z-10 text-center animate-fade-in-up hover-lift ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="inline-flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl mb-4 animate-pulse-glow">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-400 tracking-widest mb-1">{num}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
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
                alt="Paciente usando Telemedicina Venezuela"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {specialties.map(({ icon: Icon, label, color, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={label}
                  ref={ref}
                  className={`hover-lift rounded-2xl p-6 text-center cursor-pointer group border border-gray-100 animate-fade-in-up ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{label}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES BANNER ─── */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white">
              Todo lo que necesitas,<br /><span className="text-blue-300">en un solo lugar</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video,       title: 'Videollamadas HD',         desc: 'Consultas en tiempo real optimizadas para Venezuela' },
              { icon: FileText,    title: 'Historial Clínico Digital', desc: 'Tus datos médicos siempre disponibles y seguros' },
              { icon: CreditCard,  title: 'Pagos Multi-moneda',       desc: 'Pago Móvil, transferencias y más' },
              { icon: Clock,       title: 'Agenda Inteligente',        desc: 'Citas en minutos con recordatorios automáticos' },
              { icon: Shield,      title: 'Seguridad Bancaria',        desc: 'Encriptación de nivel financiero para tus datos' },
              { icon: MessageCircle, title: 'Chat Médico',             desc: 'Comunícate con tu doctor antes y después de la consulta' },
            ].map(({ icon: Icon, title, desc }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={title}
                  ref={ref}
                  className={`glass rounded-2xl p-6 hover-lift animate-fade-in-up ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="p-3 bg-blue-500/20 rounded-xl inline-flex mb-4">
                    <Icon className="h-6 w-6 text-blue-200" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Testimonios</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mt-2">
              Lo que dicen<br /><span className="text-gradient">nuestros usuarios</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, text, stars }, i) => {
              const { ref, visible } = useVisible();
              return (
                <div
                  key={name}
                  ref={ref}
                  className={`bg-white rounded-2xl p-8 shadow-lg hover-lift animate-fade-in-up border border-gray-100 ${visible ? '' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex mb-4">
                    {Array.from({ length: stars }).map((_, s) => (
                      <Star key={s} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                      <p className="text-gray-500 text-xs">{role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-float delay-400" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
            Tu salud no puede<br />esperar
          </h2>
          <p className="text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
            Únete a miles de venezolanos que ya cuidan su salud de forma digital.
            Registro gratuito, sin tarjeta de crédito.
          </p>
          <Link to="/auth/register?type=patient">
            <button className="group inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white text-blue-700 font-black text-xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300">
              Empieza Gratis Ahora
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
          <p className="text-blue-300 text-sm mt-6">✓ Sin costo de registro&nbsp;&nbsp;✓ Cancela cuando quieras</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Telemedicina Venezuela</span>
            </div>
            <p className="text-sm">© 2024 Telemedicina Venezuela. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
