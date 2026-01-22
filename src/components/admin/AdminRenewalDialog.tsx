import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: (Loan & { bookTitle: string; userName: string; userEmail: string }) | null;
  onConfirm: (loanId: string, extraDays: number, adminNotes?: string) => void;
}

const MAX_RENEWALS = 2;
const DEFAULT_RENEWAL_DAYS = 15;

export function AdminRenewalDialog({ open, onOpenChange, loan, onConfirm }: AdminRenewalDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extraDays, setExtraDays] = useState(DEFAULT_RENEWAL_DAYS);
  const [adminNotes, setAdminNotes] = useState('');

  const handleConfirm = async () => {
    if (!loan) return;

    setIsSubmitting(true);
    try {
      onConfirm(loan.id, extraDays, adminNotes);

      toast({
        title: 'Renovação registrada',
        description: `Empréstimo de "${loan.bookTitle}" renovado por mais ${extraDays} dias.`,
      });

      setAdminNotes('');
      setExtraDays(DEFAULT_RENEWAL_DAYS);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a renovação.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loan) return null;

  const currentRenewals = loan.renewalCount || 0;
  const newDueDate = addDays(new Date(loan.dueDate), extraDays);
  const canRenew = currentRenewals < MAX_RENEWALS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw size={20} className="text-primary" />
            Registrar Renovação Manual
          </DialogTitle>
          <DialogDescription>
            Registre uma renovação feita presencialmente sem passar pelo app.
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
              <span className="text-muted-foreground">Prazo atual:</span>
              <span>{format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Renovações anteriores:</span>
              <Badge variant={currentRenewals >= MAX_RENEWALS ? 'destructive' : 'secondary'}>
                {currentRenewals}/{MAX_RENEWALS}
              </Badge>
            </div>
          </div>

          {!canRenew && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              <p><strong>Atenção:</strong> Este empréstimo já atingiu o limite de renovações. 
                Você pode prosseguir como exceção administrativa.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="extraDays">Dias adicionais</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                id="extraDays"
                min={1}
                max={60}
                className="w-24"
                value={extraDays}
                onChange={(e) => setExtraDays(parseInt(e.target.value) || DEFAULT_RENEWAL_DAYS)}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Novo prazo: {format(newDueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações do Administrador</Label>
            <Textarea
              placeholder="Notas internas sobre esta renovação manual..."
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
            {isSubmitting ? 'Registrando...' : 'Confirmar Renovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
