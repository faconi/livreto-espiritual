import { useState } from 'react';
import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, BookMarked, Calendar, CheckCircle, Info } from 'lucide-react';
import { useLoan } from '@/contexts/LoanContext';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Badge } from '@/components/ui/badge';

interface LoanRequestDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (book: Book) => void;
}

export function LoanRequestDialog({
  book,
  open,
  onOpenChange,
  onConfirm,
}: LoanRequestDialogProps) {
  const { requestLoan, activeLoans, canBorrow } = useLoan();
  const { businessRules } = useSystemSettings();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!book) return null;

  const { allowed, reason } = canBorrow(book.id);
  const remainingLoans = businessRules.maxSimultaneousLoans - activeLoans.length;
  const stockInfo = { forLoan: book.availableForLoan, forSale: book.availableForSale };

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    const success = await requestLoan(book);
    
    if (success) {
      onConfirm(book);
      onOpenChange(false);
    }
    
    setIsConfirming(false);
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + businessRules.maxLoanDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="text-primary" size={20} />
            Confirmar Empréstimo
          </DialogTitle>
          <DialogDescription>
            Você está solicitando o empréstimo do livro:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img
              src={book.coverUrl || '/placeholder.svg'}
              alt={book.title}
              className="w-16 h-24 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              {book.spiritAuthor && (
                <p className="text-xs text-primary">Espírito: {book.spiritAuthor}</p>
              )}
              {stockInfo && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {stockInfo.forLoan} disponível(is)
                </Badge>
              )}
            </div>
          </div>

          {/* Loan status info */}
          <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
            <Info size={16} className="text-muted-foreground" />
            <span>
              Você possui <strong>{activeLoans.length}</strong> de <strong>{businessRules.maxSimultaneousLoans}</strong> empréstimos ativos
              {remainingLoans > 0 && (
                <span className="text-muted-foreground"> ({remainingLoans} disponível)</span>
              )}
            </span>
          </div>

          {!allowed && (
            <div className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive p-3 rounded-lg">
              <AlertTriangle size={16} />
              <span>{reason}</span>
            </div>
          )}

          {allowed && (
            <>
              <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary p-3 rounded-lg">
                <Calendar size={16} />
                <span>
                  Data de devolução: <strong>{dueDate.toLocaleDateString('pt-BR')}</strong>
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <AlertTriangle size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
                  <p>
                    <strong>Responsabilidade do leitor:</strong> Você é responsável por retirar o livro 
                    na biblioteca e devolvê-lo em bom estado dentro do prazo de <strong>{businessRules.maxLoanDays} dias</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle size={16} className="mt-0.5 text-green-500 flex-shrink-0" />
                  <p>
                    Você pode renovar o empréstimo até {businessRules.maxRenewals}x, mediante justificativa, 
                    sujeito à aprovação do administrador.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isConfirming || !allowed}
          >
            {isConfirming ? 'Confirmando...' : 'Confirmar Empréstimo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
