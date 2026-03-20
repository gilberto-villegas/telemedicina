import { Video, Phone, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AppointmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'videoconsulta' | 'teleconsulta' | 'presencial') => void;
  doctorName: string;
}

export function AppointmentTypeModal({ isOpen, onClose, onSelect, doctorName }: AppointmentTypeModalProps) {
  const types = [
    {
      id: 'videoconsulta' as const,
      title: 'Videoconsulta',
      description: 'Consulta por videollamada HD en tiempo real.',
      icon: Video,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500/50',
      shadow: 'hover:shadow-blue-500/10'
    },
    {
      id: 'teleconsulta' as const,
      title: 'Teleconsulta',
      description: 'Consulta remota vía chat o llamada de voz.',
      icon: Phone,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      hoverBorder: 'hover:border-emerald-500/50',
      shadow: 'hover:shadow-emerald-500/10'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />
        
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                  ¿Cómo desea su consulta?
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-500 font-medium">
                  Seleccione la modalidad para su cita con el <span className="text-blue-600 font-bold">Dr. {doctorName}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={cn(
                  "group relative w-full flex items-center gap-5 p-5 rounded-3xl border-2 border-slate-100 transition-all duration-300 text-left",
                  "hover:bg-white hover:scale-[1.02] active:scale-[0.98]",
                  type.hoverBorder,
                  type.shadow
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-black/5",
                  type.lightColor
                )}>
                  <type.icon className={cn("w-7 h-7", type.color.replace('bg-', 'text-'))} />
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-tight">
                    {type.description}
                  </p>
                </div>

                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-400 font-medium">
            Todas las modalidades requieren validación de pago previo.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
