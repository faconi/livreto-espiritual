import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { SearchFilters } from '@/components/books/SearchFilters';
import { mockBooks } from '@/data/mockBooks';
import { SearchFilters as FilterType } from '@/types';
import { BookOpen } from 'lucide-react';

export default function Catalog() {
  const [filters, setFilters] = useState<FilterType>({});

  const filteredBooks = useMemo(() => {
    return mockBooks.filter(book => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author.toLowerCase().includes(query);
        const matchesSpirit = book.spiritAuthor?.toLowerCase().includes(query);
        const matchesPublisher = book.publisher.toLowerCase().includes(query);
        const matchesIsbn = book.isbn?.includes(query);
        
        if (!matchesTitle && !matchesAuthor && !matchesSpirit && !matchesPublisher && !matchesIsbn) {
          return false;
        }
      }

      // Author filter
      if (filters.author) {
        if (!book.author.toLowerCase().includes(filters.author.toLowerCase())) {
          return false;
        }
      }

      // Spirit author filter
      if (filters.spiritAuthor) {
        if (!book.spiritAuthor?.toLowerCase().includes(filters.spiritAuthor.toLowerCase())) {
          return false;
        }
      }

      // Publisher filter
      if (filters.publisher) {
        if (book.publisher !== filters.publisher) {
          return false;
        }
      }

      // Category filter
      if (filters.category) {
        if (book.category !== filters.category) {
          return false;
        }
      }

      // Availability filters
      if (filters.availableForLoan && book.availableForLoan <= 0) {
        return false;
      }
      if (filters.availableForSale && book.availableForSale <= 0) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <MainLayout>
      <div className="container py-8">
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

          {/* Search and filters */}
          <SearchFilters 
            filters={filters} 
            onFiltersChange={setFilters}
          />

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {filteredBooks.length} livro{filteredBooks.length !== 1 ? 's' : ''} encontrado{filteredBooks.length !== 1 ? 's' : ''}
          </div>

          {/* Books grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <div 
                  key={book.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
