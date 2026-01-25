import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, mapDbBookToBook, mapBookToDbBook } from '@/services/database';
import { Book } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useBooks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const dbBooks = await db.getBooks();
      return dbBooks.map(mapDbBookToBook);
    },
  });

  const createBook = useMutation({
    mutationFn: async (book: Partial<Book>) => {
      const dbBook = mapBookToDbBook(book);
      const created = await db.createBook(dbBook);
      return mapDbBookToBook(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Livro cadastrado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao cadastrar livro', description: error.message, variant: 'destructive' });
    },
  });

  const updateBook = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Book> }) => {
      const dbUpdates = mapBookToDbBook(updates);
      const updated = await db.updateBook(id, dbUpdates);
      return mapDbBookToBook(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Livro atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar livro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      await db.deleteBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Livro removido com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover livro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    books,
    isLoading,
    error,
    createBook,
    updateBook,
    deleteBook,
  };
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async () => {
      const dbBook = await db.getBookById(id);
      return dbBook ? mapDbBookToBook(dbBook) : null;
    },
    enabled: !!id,
  });
}
