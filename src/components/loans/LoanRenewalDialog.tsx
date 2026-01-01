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
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanRenewalDialogProps {
  loan: (Loan & { bookTitle?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (loanId: string, justification: string) => void;
}

export function LoanRenewalDialog({
  loan,
  open,
  onOpenChange,
  onConfirm,
}: LoanRenewalDialogProps) {
  const { toast } = useToast();
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loan) return null;

  const newDueDate = new Date(loan.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 15);

  const handleConfirm = () => {
    if (!justification.trim()) {
      setError('A justificativa é obrigatória para renovação');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    setTimeout(() => {
      onConfirm(loan.id, justification);
      setIsSubmitting(false);
      setJustification('');
      onOpenChange(false);
      
      toast({
        title: 'Renovação solicitada!',
        description: 'O administrador irá analisar sua solicitação.',
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="text-primary" size={20} />
            Solicitar Renovação
          </DialogTitle>
          <DialogDescription>
            Você está solicitando a renovação do empréstimo do livro{' '}
            <strong>{loan.bookTitle || 'selecionado'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary p-3 rounded-lg">
            <Calendar size={16} />
            <span>
              Nova data de vencimento: <strong>{newDueDate.toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>

          <div>
            <Label htmlFor="renewal-justification">
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="renewal-justification"
              placeholder="Por que você precisa renovar o empréstimo? (obrigatório)"
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError('');
              }}
              className={`mt-1.5 ${error ? 'border-destructive' : ''}`}
              rows={3}
            />
            {error && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            A renovação será analisada pelo administrador e você será notificado 
            sobre a decisão.
          </p>

          {(loan.renewalCount || 0) > 0 && (
            <div className="flex items-center gap-2 text-sm bg-amber-500/10 text-amber-600 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span>
                Este livro já foi renovado {loan.renewalCount} vez(es). 
                Renovações adicionais estão sujeitas a aprovação especial.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Solicitar Renovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}