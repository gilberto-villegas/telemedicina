import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { authService } from '@/lib/auth';
import { api } from '@/lib/api';
import { BodyMap } from '@/components/medical/BodyMap';
import { Upload, ChevronRight, ChevronLeft, Save, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  type: 'text' | 'select' | 'body_map' | 'file';
  options?: string[];
  is_required: boolean;
  order: number;
}

export default function PatientQuestionnaire() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user] = useState(authService.getUser());
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-questions');
      setQuestions(res.data);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      const formattedResponses = Object.entries(responses).map(([questionId, value]) => {
        const question = questions.find(q => q.id === questionId);
        if (question?.type === 'body_map') {
            return {
                question_id: questionId,
                response_text: value.join(', '),
                body_parts: value
            };
        }
        return {
          question_id: questionId,
          response_text: value,
        };
      });

      formData.append('responses', JSON.stringify(formattedResponses));
      files.forEach((file) => {
        formData.append('attachments[]', file);
      });

      await api.post(`/appointments/${id}/responses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Cuestionario enviado con éxito');
      navigate(`/dashboard/patient/appointments/${id}`);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error al enviar el cuestionario');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const steps = [
    { title: 'Motivo y Ubicación', icon: AlertCircle },
    { title: 'Documentación', icon: Upload },
    { title: 'Antecedentes', icon: FileText },
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            Cuestionario Médico Pre-Consulta
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Complete esta información para que su doctor pueda brindarle una mejor atención.
          </p>
          
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>Progreso: {Math.round(progress)}%</span>
              <span>Paso {currentStep} de {steps.length}</span>
            </div>
            <Progress value={progress} className="h-3 rounded-full bg-slate-100" />
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 p-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-primary" })}
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Información vital para su diagnóstico</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  {questions.filter(q => q.order <= 2).map((q) => (
                    <div key={q.id} className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        {q.question_text}
                        {q.is_required && <span className="text-red-500">*</span>}
                      </label>
                      <Textarea
                        placeholder="Escriba aquí..."
                        className="min-h-[120px] rounded-2xl bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white transition-all text-lg"
                        value={responses[q.id] || ''}
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  {questions.filter(q => q.type === 'body_map').map((q) => (
                    <div key={q.id} className="space-y-4">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                        {q.question_text}
                      </label>
                      <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200">
                        <BodyMap
                          selectedParts={responses[q.id] || []}
                          onSelectPart={(part) => {
                            const current = responses[q.id] || [];
                            const next = current.includes(part)
                              ? current.filter((p: string) => p !== part)
                              : [...current, part];
                            handleResponseChange(q.id, next);
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(responses[q.id] || []).map((part: string) => (
                          <span key={part} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 animate-in zoom-in-50 duration-200">
                             <CheckCircle2 className="h-3 w-3" /> {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center p-12 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 transition-colors hover:bg-primary/10 group cursor-pointer relative">
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <div className="h-20 w-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                        <Upload className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Subir Documentación</h3>
                    <p className="text-slate-500 font-medium text-center mt-2 max-w-sm">
                        Cargue radiografías, resultados de exámenes, fotos o videos que puedan ayudar a su médico.
                    </p>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {files.map((file, idx) => (
                      <div key={idx} className="group relative p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <button 
                            onClick={() => removeFile(idx)}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10 max-w-2xl mx-auto">
                {questions.filter(q => q.order >= 5).map((q) => (
                  <div key={q.id} className="space-y-4">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                      {q.question_text}
                    </label>
                    {q.type === 'select' ? (
                      <Select 
                        onValueChange={(val) => handleResponseChange(q.id, val)}
                        value={responses[q.id] || ''}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent text-lg font-medium">
                          <SelectValue placeholder="Seleccione una opción" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                          {q.options?.map(opt => (
                            <SelectItem key={opt} value={opt} className="rounded-xl py-3 font-medium">
                                {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Textarea
                        placeholder="Escriba aquí sus dudas iniciales..."
                        className="min-h-[150px] rounded-2xl bg-slate-50 border-transparent text-lg"
                        value={responses[q.id] || ''}
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-8 bg-slate-50/30 border-t border-slate-100/50 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="h-12 rounded-2xl font-bold gap-2 text-slate-500 hover:text-primary transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                className="h-12 rounded-2xl px-8 font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                Siguiente
                <ChevronRight className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="h-12 rounded-2xl px-10 font-black text-lg gap-2 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 hover:scale-105 transition-all"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-6 w-6" />
                    Finalizar y Enviar
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
