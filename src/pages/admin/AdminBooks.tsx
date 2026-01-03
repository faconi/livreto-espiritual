import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, Edit, Package, Users, History } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockBooks } from '@/data/mockBooks';
import { Book } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock loan/sale history for books
const mockBookHistory = {
  '1': {
    loans: [
      { id: 'l1', userName: 'João Silva', status: 'active', date: '2024-01-15', dueDate: '2024-01-30' },
      { id: 'l2', userName: 'Maria Santos', status: 'returned', date: '2023-12-01', returnedAt: '2023-12-14' },
    ],
    sales: [
      { id: 's1', userName: 'Pedro Lima', quantity: 1, total: 45, date: '2024-01-10' },
      { id: 's2', userName: 'Ana Costa', quantity: 2, total: 90, date: '2023-11-20' },
    ],
  },
};

export default function AdminBooks() {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const columns: ColumnDef<Book>[] = [
    {
      id: 'title',
      header: 'Título',
      accessorKey: 'title',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (row) => (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBook(row);
            setDetailsOpen(true);
          }}
        >
          {row.coverUrl && (
            <img 
              src={row.coverUrl} 
              alt={row.title}
              className="w-10 h-14 object-cover rounded"
            />
          )}
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-sm text-muted-foreground">{row.author}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'spiritAuthor',
      header: 'Espírito Autor',
      accessorKey: 'spiritAuthor',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'publisher',
      header: 'Editora',
      accessorKey: 'publisher',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [...new Set(mockBooks.map(b => b.publisher))].map(p => ({ label: p, value: p })),
    },
    {
      id: 'category',
      header: 'Categoria',
      accessorKey: 'category',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [...new Set(mockBooks.map(b => b.category).filter(Boolean))].map(c => ({ label: c!, value: c! })),
    },
    {
      id: 'loanStock',
      header: 'Empréstimo',
      accessorFn: (row) => `${row.availableForLoan}/${row.quantityForLoan}`,
      cell: (row) => (
        <Badge variant={row.availableForLoan > 0 ? 'default' : 'destructive'}>
          {row.availableForLoan}/{row.quantityForLoan}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: 'saleStock',
      header: 'Venda',
      accessorFn: (row) => `${row.availableForSale}/${row.quantityForSale}`,
      cell: (row) => (
        <Badge variant={row.availableForSale > 0 ? 'secondary' : 'destructive'}>
          {row.availableForSale}/{row.quantityForSale}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: 'price',
      header: 'Preço',
      accessorKey: 'salePrice',
      sortable: true,
      cell: (row) => row.salePrice ? `R$ ${row.salePrice.toFixed(2)}` : '-',
    },
  ];

  const handleRowClick = (book: Book) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };

  const bookHistory = selectedBook ? mockBookHistory[selectedBook.id as keyof typeof mockBookHistory] : null;

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-primary" size={28} />
          <h1 className="text-3xl font-serif font-bold">Gerenciar Livros</h1>
        </div>

        <DataTable
          data={mockBooks}
          columns={columns}
          searchPlaceholder="Buscar livros..."
          searchableFields={['title', 'author', 'spiritAuthor', 'isbn']}
          onRowClick={handleRowClick}
          isAdmin
          onCreate={() => navigate('/admin/livros/novo')}
          onExport={() => console.log('Export books')}
          onImport={(file) => console.log('Import books', file)}
          idField="id"
          showViewToggle
          defaultView="table"
        />

        {/* Book Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedBook?.coverUrl && (
                  <img 
                    src={selectedBook.coverUrl} 
                    alt={selectedBook.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <span className="text-xl">{selectedBook?.title}</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    {selectedBook?.author}
                    {selectedBook?.spiritAuthor && ` (${selectedBook.spiritAuthor})`}
                  </p>
                </div>
              </DialogTitle>
              <DialogDescription>
                Detalhes completos e histórico do livro
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 py-4">
                {/* Book Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package size={16} />
                        Estoque
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empréstimo:</span>
                        <Badge variant={selectedBook?.availableForLoan ? 'default' : 'destructive'}>
                          {selectedBook?.availableForLoan}/{selectedBook?.quantityForLoan} disponíveis
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Venda:</span>
                        <Badge variant={selectedBook?.availableForSale ? 'secondary' : 'destructive'}>
                          {selectedBook?.availableForSale}/{selectedBook?.quantityForSale} disponíveis
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISBN:</span>
                        <span>{selectedBook?.isbn || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Editora:</span>
                        <span>{selectedBook?.publisher}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoria:</span>
                        <span>{selectedBook?.category || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço:</span>
                        <span className="font-medium">
                          R$ {selectedBook?.salePrice?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Loan History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History size={16} />
                      Histórico de Empréstimos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookHistory?.loans && bookHistory.loans.length > 0 ? (
                      <div className="space-y-3">
                        {bookHistory.loans.map((loan) => (
                          <div 
                            key={loan.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Users size={16} className="text-muted-foreground" />
                              <div>
                                <p className="font-medium">{loan.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Emprestado em {loan.date}
                                </p>
                              </div>
                            </div>
                            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                              {loan.status === 'active' ? 'Ativo' : 'Devolvido'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum empréstimo registrado
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Sales History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History size={16} />
                      Histórico de Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookHistory?.sales && bookHistory.sales.length > 0 ? (
                      <div className="space-y-3">
                        {bookHistory.sales.map((sale) => (
                          <div 
                            key={sale.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Users size={16} className="text-muted-foreground" />
                              <div>
                                <p className="font-medium">{sale.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {sale.quantity}x em {sale.date}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-green-600">
                              R$ {sale.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma venda registrada
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setDetailsOpen(false);
                      navigate(`/admin/livros/${selectedBook?.id}/editar`);
                    }}
                  >
                    <Edit size={16} className="mr-2" />
                    Editar Livro
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/livro/${selectedBook?.id}`)}
                  >
                    <Eye size={16} className="mr-2" />
                    Ver Página Pública
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
