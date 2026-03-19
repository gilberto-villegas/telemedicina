import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Stethoscope } from 'lucide-react';

interface SpecialtyAlphabetFilterProps {
  specialties: string[];
  onSelectSpecialty: (specialty: string) => void;
  selectedSpecialty: string;
}

export const SpecialtyAlphabetFilter: React.FC<SpecialtyAlphabetFilterProps> = ({
  specialties,
  onSelectSpecialty,
  selectedSpecialty,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // Group specialties by first letter
  const groupedSpecialties = specialties.reduce((acc, specialty) => {
    const firstLetter = specialty.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(specialty);
    return acc;
  }, {} as Record<string, string[]>);

  const availableLetters = Object.keys(groupedSpecialties);

  const handleLetterClick = (letter: string) => {
    if (groupedSpecialties[letter]) {
      setSelectedLetter(letter);
      setIsModalOpen(true);
    }
  };

  const handleSpecialtySelect = (specialty: string) => {
    onSelectSpecialty(specialty);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-muted-foreground font-medium">
          Todas nuestras especialidades, servicios, unidades y programas se encuentran agrupados en orden alfabético, selecciónelo por su letra de inicio:
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
        {alphabet.map((letter) => {
          const isAvailable = availableLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={!isAvailable}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-md",
                isAvailable 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg cursor-pointer" 
                  : "bg-muted text-muted-foreground opacity-30 cursor-not-allowed"
              )}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        {selectedSpecialty && (
          <Button 
            variant="outline" 
            onClick={() => onSelectSpecialty('')}
            className="rounded-full px-6"
          >
            Limpiar filtro: {selectedSpecialty}
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background to-accent/5">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-primary">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold">{selectedLetter}</span>
              </div>
              Especialidades con "{selectedLetter}"
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            {selectedLetter && groupedSpecialties[selectedLetter]?.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtySelect(specialty)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left group hover:shadow-md",
                  selectedSpecialty === specialty
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card hover:bg-accent border-transparent hover:border-accent-foreground/10"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  selectedSpecialty === specialty ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="font-medium">{specialty}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
