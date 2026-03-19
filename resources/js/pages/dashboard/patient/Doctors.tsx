;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stethoscope, Star, Search, ChevronRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { SpecialtyAlphabetFilter } from '@/components/doctors/SpecialtyAlphabetFilter';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: any;
  specialty_id: string;
  rating: number | null;
  consultation_price_usd: number;
  is_verified: boolean;
  avatar_url?: string;
}

interface Specialty {
  id: string;
  name: string;
  slug: string;
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(''); // This will now store the specialty NAME for UI
  const [specialtyIdFilter, setSpecialtyIdFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewStep, setViewStep] = useState<'search' | 'results'>('search');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'patient') {
      navigate(`/dashboard/${currentUser?.type || 'patient'}`);
      return;
    }

    setUser(currentUser);
    loadInitialData();
  }, [navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, specsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/specialties')
      ]);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setAllSpecialties(Array.isArray(specsRes.data) ? specsRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = !specialtyIdFilter || 
      doctor.specialty_id === specialtyIdFilter || 
      (typeof doctor.specialty === 'string' && doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase()) ||
      (typeof doctor.specialty === 'object' && doctor.specialty?.name?.toLowerCase() === specialtyFilter.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  const handleSelectSpecialty = (specialtyName: string) => {
    const spec = allSpecialties.find(s => s.name === specialtyName);
    if (spec) {
      setSpecialtyFilter(spec.name);
      setSpecialtyIdFilter(spec.id);
      setViewStep('results');
    } else {
      setSpecialtyFilter('');
      setSpecialtyIdFilter('');
      setViewStep('search');
    }
  };

  const handleBackToSearch = () => {
    setSpecialtyFilter('');
    setSpecialtyIdFilter('');
    setViewStep('search');
  };

  const specialtyNames = allSpecialties.map(s => s.name);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link to="/dashboard/patient" className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold uppercase tracking-widest">Panel Principal</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Nuestros Especialistas
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Encuentra atención médica de primer nivel con los mejores profesionales en cada especialidad.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar médico por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 transition-all text-lg"
            />
          </div>
        </div>

        {viewStep === 'search' ? (
          <section className="bg-card/50 backdrop-blur-sm border rounded-[2.5rem] p-8 shadow-xl shadow-primary/5">
            <SpecialtyAlphabetFilter 
              specialties={specialtyNames} 
              onSelectSpecialty={handleSelectSpecialty}
              selectedSpecialty={specialtyFilter}
            />
          </section>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToSearch}
                  className="rounded-xl flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a especialidades
                </Button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-primary" />
                  Médicos en {specialtyFilter}
                  <span className="ml-2 text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {filteredDoctors.length}
                  </span>
                </h2>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-20 text-center space-y-4">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">No se encontraron especialistas</p>
                    <p className="text-muted-foreground">Actualmente no tenemos médicos registrados en esta especialidad.</p>
                  </div>
                  <Button variant="outline" onClick={handleBackToSearch} className="rounded-xl">
                    Ver otras especialidades
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <CardHeader className="relative pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-500 border-2 border-white shadow-sm">
                            {doctor.avatar_url ? (
                              <img src={doctor.avatar_url} alt={`Dr. ${doctor.last_name}`} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                              <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                <Stethoscope className="h-10 w-10 text-blue-400 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground font-medium">
                              <span className="bg-accent px-2 py-0.5 rounded">
                                {typeof doctor.specialty === 'object' ? (doctor.specialty?.name || 'Médico') : (doctor.specialty || 'Médico')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {doctor.is_verified && (
                          <div className="bg-green-500/10 text-green-600 p-1 rounded-full" title="Verificado">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">
                            {doctor.rating != null && !isNaN(Number(doctor.rating))
                              ? Number(doctor.rating).toFixed(1)
                              : '4.5'}
                          </span>
                          <span className="text-xs text-muted-foreground">(Promedio)</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Por consulta</p>
                          <p className="font-black text-xl text-primary">${doctor.consultation_price_usd}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link to={`/dashboard/patient/doctors/${doctor.id}/book`} className="flex-1">
                          <Button className="w-full h-12 rounded-xl text-lg font-semibold group-hover:shadow-[0_10px_20px_-10px_rgba(var(--primary),0.5)] transition-all">
                            Agendar Cita
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <Link to={`/dashboard/patient/chat?doctor=${doctor.id}`}>
                          <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all p-0">
                            <MessageSquare className="h-6 w-6" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

