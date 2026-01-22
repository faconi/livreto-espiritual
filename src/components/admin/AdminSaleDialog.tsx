import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Search, User, CreditCard, Banknote } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { mockBooks } from '@/data/mockBooks';

// Mock users
const mockUsers = [
  { id: '2', name: 'João Silva', email: 'joao@email.com' },
  { id: '3', name: 'Maria Santos', email: 'maria@email.com' },
  { id: '4', name: 'Pedro Lima', email: 'pedro@email.com' },
  { id: '5', name: 'Ana Costa', email: 'ana@email.com' },
];

const saleFormSchema = z.object({
  userId: z.string().min(1, 'Selecione um usuário'),
  bookId: z.string().min(1, 'Selecione um livro'),
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  paymentMethod: z.enum(['cash', 'pix'], { required_error: 'Selecione o método de pagamento' }),
  paymentStatus: z.enum(['pending', 'completed']).default('completed'),
  adminNotes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface AdminSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    userId: string;
    userName: string;
    userEmail: string;
    bookId: string;
    bookTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: 'cash' | 'pix';
    paymentStatus: 'pending' | 'completed';
    adminNotes?: string;
  }) => void;
}

export function AdminSaleDialog({ open, onOpenChange, onConfirm }: AdminSaleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      userId: '',
      bookId: '',
      quantity: 1,
      paymentMethod: 'pix',
      paymentStatus: 'completed',
      adminNotes: '',
    },
  });

  const selectedBookId = form.watch('bookId');
  const selectedUserId = form.watch('userId');
  const quantity = form.watch('quantity') || 1;

  const selectedBook = mockBooks.find(b => b.id === selectedBookId);
  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const availableBooks = mockBooks.filter(b =>
    b.availableForSale > 0 &&
    (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const unitPrice = selectedBook?.salePrice || 0;
  const totalPrice = unitPrice * quantity;
  const maxQuantity = selectedBook?.availableForSale || 1;

  const handleSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true);
    try {
      const user = mockUsers.find(u => u.id === data.userId);
      const book = mockBooks.find(b => b.id === data.bookId);

      if (!user || !book) {
        throw new Error('Usuário ou livro não encontrado');
      }

      if (data.quantity > book.availableForSale) {
        toast({
          title: 'Estoque insuficiente',
          description: `Apenas ${book.availableForSale} unidades disponíveis.`,
          variant: 'destructive',
        });
        return;
      }

      onConfirm({
        userId: data.userId,
        userName: user.name,
        userEmail: user.email,
        bookId: data.bookId,
        bookTitle: book.title,
        quantity: data.quantity,
        unitPrice: book.salePrice || 0,
        totalPrice: (book.salePrice || 0) * data.quantity,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        adminNotes: data.adminNotes,
      });

      toast({
        title: 'Venda registrada',
        description: `Venda de ${data.quantity}x "${book.title}" para ${user.name} registrada.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a venda.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Registrar Venda Manual
          </DialogTitle>
          <DialogDescription>
            Registre uma venda realizada presencialmente que não passou pelo app.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-1">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar cliente..."
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
                  <SelectValue placeholder="Selecione um cliente" />
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
                          R$ {book.salePrice?.toFixed(2)} ({book.availableForSale} disp.)
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

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                type="number"
                min={1}
                max={maxQuantity}
                className="w-24"
                {...form.register('quantity')}
              />
              {selectedBook && (
                <p className="text-xs text-muted-foreground">
                  Máximo disponível: {selectedBook.availableForSale} unidades
                </p>
              )}
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Método de Pagamento *</Label>
              <RadioGroup
                value={form.watch('paymentMethod')}
                onValueChange={(value) => form.setValue('paymentMethod', value as 'cash' | 'pix')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard size={16} className="text-primary" />
                    PIX
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    <Banknote size={16} className="text-green-600" />
                    Dinheiro
                  </Label>
                </div>
              </RadioGroup>
              {form.formState.errors.paymentMethod && (
                <p className="text-sm text-destructive">{form.formState.errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select
                value={form.watch('paymentStatus')}
                onValueChange={(value) => form.setValue('paymentStatus', value as 'pending' | 'completed')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            {selectedBook && selectedUser && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
                <p><strong>Cliente:</strong> {selectedUser.name}</p>
                <p><strong>Livro:</strong> {selectedBook.title}</p>
                <p><strong>Quantidade:</strong> {quantity}x R$ {unitPrice.toFixed(2)}</p>
                <p className="text-lg font-bold text-green-600">Total: R$ {totalPrice.toFixed(2)}</p>
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações do Administrador</Label>
              <Textarea
                placeholder="Notas internas sobre esta venda manual..."
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
            {isSubmitting ? 'Registrando...' : 'Registrar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
