import { useQuery } from '@tanstack/react-query';
import { db, mapDbBookToBook } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSaleWithBook {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'cash' | 'pix';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export function useUserSales() {
  const { user } = useAuth();

  const { data: sales = [], isLoading, error } = useQuery({
    queryKey: ['user-sales', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const dbSales = await db.getSales(user.id);
      
      return dbSales.map(sale => ({
        id: sale.id,
        bookId: sale.book_id,
        bookTitle: sale.books?.title || 'Livro não encontrado',
        bookCover: sale.books?.cover_url || '/placeholder.svg',
        quantity: sale.quantity,
        unitPrice: Number(sale.unit_price),
        totalPrice: Number(sale.total_price),
        paymentMethod: (sale.payment_method || 'pix') as 'cash' | 'pix',
        paymentStatus: sale.status === 'confirmed' ? 'completed' : sale.status === 'cancelled' ? 'failed' : 'pending',
        createdAt: new Date(sale.created_at),
      } as UserSaleWithBook));
    },
    enabled: !!user,
  });

  const completedSales = sales.filter(s => s.paymentStatus === 'completed');
  const pendingSales = sales.filter(s => s.paymentStatus === 'pending');

  return {
    sales,
    completedSales,
    pendingSales,
    isLoading,
    error,
  };
}
