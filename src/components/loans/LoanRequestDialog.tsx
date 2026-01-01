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
import { AlertTriangle, BookMarked, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!book) return null;

  const handleConfirm = () => {
    setIsConfirming(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm(book);
      setIsConfirming(false);
      onOpenChange(false);
      
      toast({
        title: 'Empréstimo confirmado!',
        description: 'Retire o livro na biblioteca. Prazo de devolução: 15 dias.',
      });
    }, 500);
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

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
            </div>
          </div>

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
                na biblioteca e devolvê-lo em bom estado dentro do prazo de <strong>15 dias</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle size={16} className="mt-0.5 text-green-500 flex-shrink-0" />
              <p>
                Você pode renovar o empréstimo uma vez, mediante justificativa, 
                sujeito à aprovação do administrador.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'Confirmando...' : 'Confirmar Empréstimo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}