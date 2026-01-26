import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/database';
import { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface SaleWithDetails {
  id: string;
  bookId: string;
  userId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: Sale['paymentMethod'];
  paymentStatus: Sale['paymentStatus'];
  createdAt: Date;
  bookTitle: string;
  userName: string;
  userEmail: string;
}

function mapDbSaleToSale(dbSale: any): SaleWithDetails {
  return {
    id: dbSale.id,
    bookId: dbSale.book_id,
    userId: dbSale.user_id,
    quantity: dbSale.quantity,
    unitPrice: Number(dbSale.unit_price),
    totalPrice: Number(dbSale.total_price),
    paymentMethod: dbSale.payment_method || 'pix',
    paymentStatus: dbSale.status === 'confirmed' ? 'completed' : dbSale.status === 'cancelled' ? 'failed' : 'pending',
    createdAt: new Date(dbSale.created_at),
    bookTitle: dbSale.books?.title || 'Livro não encontrado',
    userName: dbSale.profiles?.full_name || 'Usuário',
    userEmail: dbSale.profiles?.email || '',
  };
}

export function useSalesAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sales = [], isLoading, error } = useQuery({
    queryKey: ['sales', 'admin'],
    queryFn: async () => {
      const dbSales = await db.getSales();
      return dbSales.map(mapDbSaleToSale);
    },
  });

  const createSale = useMutation({
    mutationFn: async (sale: {
      userId: string;
      bookId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      paymentMethod: 'cash' | 'pix';
      status: 'pending' | 'confirmed';
      adminNotes?: string;
    }) => {
      await db.createSale({
        user_id: sale.userId,
        book_id: sale.bookId,
        quantity: sale.quantity,
        unit_price: sale.unitPrice,
        total_price: sale.totalPrice,
        payment_method: sale.paymentMethod,
        status: sale.status,
        admin_notes: sale.adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: 'Venda registrada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar venda', description: error.message, variant: 'destructive' });
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async (saleId: string) => {
      await db.updateSale(saleId, { status: 'confirmed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: 'Pagamento confirmado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const cancelSale = useMutation({
    mutationFn: async (saleId: string) => {
      await db.updateSale(saleId, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: 'Venda cancelada.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sales,
    isLoading,
    error,
    createSale,
    confirmPayment,
    cancelSale,
  };
}
