import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { BookCard } from '@/components/books/BookCard';
import { BookListItem } from '@/components/books/BookListItem';
import { Badge } from '@/components/ui/badge';
import { mockBooks, categories, publishers } from '@/data/mockBooks';
import { Book } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Catalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const columns: ColumnDef<Book>[] = useMemo(() => [
    {
      id: 'title',
      header: 'Título',
      accessorKey: 'title',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (book) => (
        <div className="flex items-center gap-3">
          <img
            src={book.coverUrl || '/placeholder.svg'}
            alt={book.title}
            className="w-10 h-14 object-cover rounded"
          />
          <div>
            <span 
              className="font-medium hover:text-primary cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/livro/${book.id}`);
              }}
            >
              {book.title}
            </span>
            {book.isbn && (
              <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'author',
      header: 'Autor',
      accessorKey: 'author',
      sortable: true,
      filterable: true,
      filterType: 'select',
    },
    {
      id: 'spiritAuthor',
      header: 'Espírito',
      accessorKey: 'spiritAuthor',
      sortable: true,
      filterable: true,
      filterType: 'select',
      cell: (book) => book.spiritAuthor || '-',
    },
    {
      id: 'publisher',
      header: 'Editora',
      accessorKey: 'publisher',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: publishers.map(p => ({ label: p, value: p })),
    },
    {
      id: 'category',
      header: 'Categoria',
      accessorKey: 'category',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: categories.map(c => ({ label: c, value: c })),
      cell: (book) => book.category ? (
        <Badge variant="outline">{book.category}</Badge>
      ) : '-',
    },
    {
      id: 'availableForLoan',
      header: 'Empréstimo',
      accessorKey: 'availableForLoan',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Disponível', value: 'available' },
        { label: 'Indisponível', value: 'unavailable' },
      ],
      cell: (book) => (
        <Badge variant={book.availableForLoan > 0 ? 'default' : 'secondary'}>
          {book.availableForLoan} disp.
        </Badge>
      ),
    },
    {
      id: 'salePrice',
      header: 'Preço',
      accessorKey: 'salePrice',
      sortable: true,
      cell: (book) => book.salePrice 
        ? `R$ ${book.salePrice.toFixed(2)}` 
        : 'Só empréstimo',
    },
  ], [navigate]);

  const handleRowClick = (book: Book) => {
    navigate(`/livro/${book.id}`);
  };

  const handleEdit = (book: Book) => {
    navigate(`/admin/livros/${book.id}/editar`);
  };

  const handleCreate = () => {
    navigate('/admin/livros/novo');
  };

  const handleExport = () => {
    // Generate CSV
    const headers = ['ISBN', 'Título', 'Autor', 'Espírito', 'Editora', 'Categoria', 'Preço', 'Empréstimo', 'Venda'];
    const rows = mockBooks.map(book => [
      book.isbn || '',
      book.title,
      book.author,
      book.spiritAuthor || '',
      book.publisher,
      book.category || '',
      book.salePrice?.toString() || '',
      book.availableForLoan.toString(),
      book.availableForSale.toString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'livros.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exportação concluída',
      description: `${mockBooks.length} livros exportados para CSV.`,
    });
  };

  const handleImport = (file: File) => {
    toast({
      title: 'Importação iniciada',
      description: `Processando arquivo ${file.name}...`,
    });
    // TODO: Implement actual import logic
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              <BookOpen className="text-primary" />
              Catálogo de Livros
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore nosso acervo espírita
            </p>
          </div>

          {/* Data Table */}
          <DataTable
            data={mockBooks}
            columns={columns}
            searchPlaceholder="Buscar por título, autor, ISBN..."
            searchableFields={['title', 'author', 'spiritAuthor', 'isbn', 'publisher']}
            onRowClick={handleRowClick}
            isAdmin={isAdmin}
            onEdit={isAdmin ? handleEdit : undefined}
            onCreate={isAdmin ? handleCreate : undefined}
            onExport={isAdmin ? handleExport : undefined}
            onImport={isAdmin ? handleImport : undefined}
            renderCard={(book) => <BookCard book={book} />}
            renderListItem={(book) => <BookListItem book={book} />}
            emptyMessage="Nenhum livro encontrado"
            emptyIcon={<BookOpen size={48} className="text-muted-foreground/50" />}
            defaultView="cards"
          />
        </div>
      </div>
    </MainLayout>
  );
}
