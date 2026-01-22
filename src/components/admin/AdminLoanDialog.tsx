import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookMarked, Search, User, Calendar } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { mockBooks } from '@/data/mockBooks';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock users
const mockUsers = [
  { id: '2', name: 'João Silva', email: 'joao@email.com' },
  { id: '3', name: 'Maria Santos', email: 'maria@email.com' },
  { id: '4', name: 'Pedro Lima', email: 'pedro@email.com' },
  { id: '5', name: 'Ana Costa', email: 'ana@email.com' },
];

const loanFormSchema = z.object({
  userId: z.string().min(1, 'Selecione um usuário'),
  bookId: z.string().min(1, 'Selecione um livro'),
  durationDays: z.coerce.number().min(1).max(60).default(15),
  adminNotes: z.string().optional(),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

interface AdminLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    userId: string;
    userName: string;
    userEmail: string;
    bookId: string;
    bookTitle: string;
    durationDays: number;
    adminNotes?: string;
  }) => void;
}

export function AdminLoanDialog({ open, onOpenChange, onConfirm }: AdminLoanDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      userId: '',
      bookId: '',
      durationDays: 15,
      adminNotes: '',
    },
  });

  const selectedBookId = form.watch('bookId');
  const selectedUserId = form.watch('userId');
  const durationDays = form.watch('durationDays') || 15;

  const selectedBook = mockBooks.find(b => b.id === selectedBookId);
  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const availableBooks = mockBooks.filter(b =>
    b.availableForLoan > 0 &&
    (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const handleSubmit = async (data: LoanFormValues) => {
    setIsSubmitting(true);
    try {
      const user = mockUsers.find(u => u.id === data.userId);
      const book = mockBooks.find(b => b.id === data.bookId);

      if (!user || !book) {
        throw new Error('Usuário ou livro não encontrado');
      }

      onConfirm({
        userId: data.userId,
        userName: user.name,
        userEmail: user.email,
        bookId: data.bookId,
        bookTitle: book.title,
        durationDays: data.durationDays,
        adminNotes: data.adminNotes,
      });

      toast({
        title: 'Empréstimo registrado',
        description: `Empréstimo de "${book.title}" para ${user.name} criado com sucesso.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o empréstimo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dueDate = addDays(new Date(), durationDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked size={20} className="text-primary" />
            Registrar Empréstimo Manual
          </DialogTitle>
          <DialogDescription>
            Registre um empréstimo realizado presencialmente que não passou pelo app.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-1">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">Usuário *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar usuário..."
                  className="pl-9"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <Select
                value={form.watch('userId')}
                onValueChange={(value) => form.setValue('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{user.name}</span>
                        <span className="text-muted-foreground text-xs">({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.userId && (
                <p className="text-sm text-destructive">{form.formState.errors.userId.message}</p>
              )}
            </div>

            {/* Book Selection */}
            <div className="space-y-2">
              <Label htmlFor="book">Livro *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar livro..."
                  className="pl-9"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
              </div>
              <Select
                value={form.watch('bookId')}
                onValueChange={(value) => form.setValue('bookId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um livro" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{book.title}</span>
                        <span className="text-muted-foreground text-xs">
                          ({book.availableForLoan} disp.)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.bookId && (
                <p className="text-sm text-destructive">{form.formState.errors.bookId.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Prazo (dias)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  className="w-24"
                  {...form.register('durationDays')}
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>Devolução: {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedBook && selectedUser && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
                <p><strong>Usuário:</strong> {selectedUser.name}</p>
                <p><strong>Livro:</strong> {selectedBook.title}</p>
                <p><strong>Autor:</strong> {selectedBook.author}</p>
                <p><strong>Prazo:</strong> {durationDays} dias (até {format(dueDate, "dd/MM/yyyy", { locale: ptBR })})</p>
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações do Administrador</Label>
              <Textarea
                placeholder="Notas internas sobre este empréstimo manual..."
                className="min-h-[80px]"
                {...form.register('adminNotes')}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Empréstimo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
