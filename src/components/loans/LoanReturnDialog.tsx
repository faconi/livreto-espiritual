import { useState } from 'react';
import { Loan } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanReturnDialogProps {
  loan: (Loan & { bookTitle?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (loanId: string, justification?: string) => void;
}

export function LoanReturnDialog({
  loan,
  open,
  onOpenChange,
  onConfirm,
}: LoanReturnDialogProps) {
  const { toast } = useToast();
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      onConfirm(loan.id, justification || undefined);
      setIsSubmitting(false);
      setJustification('');
      onOpenChange(false);
      
      toast({
        title: 'Devolução solicitada!',
        description: 'O administrador será notificado. Leve o livro à biblioteca para finalizar.',
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="text-primary" size={20} />
            Solicitar Devolução
          </DialogTitle>
          <DialogDescription>
            Você está solicitando a devolução do livro{' '}
            <strong>{loan.bookTitle || 'selecionado'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="justification">Justificativa (opcional)</Label>
            <Textarea
              id="justification"
              placeholder="Alguma observação sobre o livro ou a devolução..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Por favor, leve o livro à biblioteca. O administrador irá confirmar o 
            recebimento e o status será atualizado.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar Devolução'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}