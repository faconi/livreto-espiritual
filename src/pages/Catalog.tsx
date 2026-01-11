import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { CatalogBookCard } from '@/components/books/CatalogBookCard';
import { CatalogBookListItem } from '@/components/books/CatalogBookListItem';
import { Badge } from '@/components/ui/badge';
import { mockBooks, categories, publishers } from '@/data/mockBooks';
import { Book } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Catalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handleWishlistToggle = (bookId: string) => {
    setWishlist(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

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
      header: 'Autor (Médium)',
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

  return (
    <MainLayout>
      <div className="container py-4 sm:py-6 px-3 sm:px-4">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2 sm:gap-3">
              <BookOpen className="text-primary" size={24} />
              Catálogo de Livros
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Explore nosso acervo espírita
            </p>
          </div>

          {/* Data Table - No create/export/import for catalog, no edit column */}
          <DataTable
            data={mockBooks}
            columns={columns}
            searchPlaceholder="Buscar por título, autor, ISBN..."
            searchableFields={['title', 'author', 'spiritAuthor', 'isbn', 'publisher']}
            onRowClick={handleRowClick}
            isAdmin={false}
            renderCard={(book) => (
              <CatalogBookCard 
                book={book} 
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={wishlist.includes(book.id)}
              />
            )}
            renderListItem={(book) => (
              <CatalogBookListItem 
                book={book} 
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={wishlist.includes(book.id)}
              />
            )}
            emptyMessage="Nenhum livro encontrado"
            emptyIcon={<BookOpen size={48} className="text-muted-foreground/50" />}
            defaultView="cards"
            showViewToggle={true}
            showFilters={true}
          />
        </div>
      </div>
    </MainLayout>
  );
}
