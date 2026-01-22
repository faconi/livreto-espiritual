import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: (Loan & { bookTitle: string; userName: string; userEmail: string }) | null;
  onConfirm: (loanId: string, adminNotes?: string) => void;
}

export function AdminReturnDialog({ open, onOpenChange, loan, onConfirm }: AdminReturnDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const handleConfirm = async () => {
    if (!loan) return;

    setIsSubmitting(true);
    try {
      onConfirm(loan.id, adminNotes);

      toast({
        title: 'Devolução registrada',
        description: `Devolução de "${loan.bookTitle}" por ${loan.userName} registrada com sucesso.`,
      });

      setAdminNotes('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a devolução.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw size={20} className="text-primary" />
            Registrar Devolução Manual
          </DialogTitle>
          <DialogDescription>
            Registre uma devolução feita presencialmente sem passar pelo app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livro:</span>
              <span className="font-medium">{loan.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuário:</span>
              <span>{loan.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emprestado em:</span>
              <span>{format(new Date(loan.borrowedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prazo:</span>
              <span>{format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status atual:</span>
              <Badge variant={loan.status === 'overdue' ? 'destructive' : 'secondary'}>
                {loan.status === 'overdue' ? 'Atrasado' : 'Ativo'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações do Administrador</Label>
            <Textarea
              placeholder="Notas internas sobre esta devolução manual..."
              className="min-h-[80px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Confirmar Devolução'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
