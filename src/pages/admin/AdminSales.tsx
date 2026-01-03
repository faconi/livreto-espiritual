import { useState } from 'react';
import { ShoppingBag, Eye, Receipt, CreditCard, Banknote } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock sales data
const mockSales: (Sale & { bookTitle: string; userName: string; userEmail: string })[] = [
  {
    id: 's1',
    bookId: '1',
    userId: '2',
    bookTitle: 'O Livro dos Espíritos',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    quantity: 1,
    unitPrice: 45,
    totalPrice: 45,
    paymentMethod: 'pix',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 's2',
    bookId: '3',
    userId: '3',
    bookTitle: 'Nosso Lar',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    quantity: 2,
    unitPrice: 48,
    totalPrice: 96,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 's3',
    bookId: '5',
    userId: '4',
    bookTitle: 'Violetas na Janela',
    userName: 'Pedro Lima',
    userEmail: 'pedro@email.com',
    quantity: 1,
    unitPrice: 35,
    totalPrice: 35,
    paymentMethod: 'pix',
    paymentStatus: 'pending',
    createdAt: new Date('2024-01-22'),
  },
  {
    id: 's4',
    bookId: '2',
    userId: '2',
    bookTitle: 'O Evangelho Segundo o Espiritismo',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    quantity: 3,
    unitPrice: 42,
    totalPrice: 126,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 's5',
    bookId: '8',
    userId: '3',
    bookTitle: 'O Livro dos Médiuns',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    quantity: 1,
    unitPrice: 47,
    totalPrice: 47,
    paymentMethod: 'pix',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-10'),
  },
];

const paymentMethodLabels: Record<Sale['paymentMethod'], string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
};

const paymentStatusConfig: Record<Sale['paymentStatus'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  completed: { label: 'Confirmado', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
};

export default function AdminSales() {
  const [selectedSale, setSelectedSale] = useState<typeof mockSales[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const columns: ColumnDef<typeof mockSales[0]>[] = [
    {
      id: 'id',
      header: 'Pedido',
      accessorKey: 'id',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">#{row.id}</span>,
    },
    {
      id: 'bookTitle',
      header: 'Livro',
      accessorKey: 'bookTitle',
      sortable: true,
      filterable: true,
    },
    {
      id: 'userName',
      header: 'Cliente',
      accessorKey: 'userName',
      sortable: true,
      filterable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.userName}</p>
          <p className="text-xs text-muted-foreground">{row.userEmail}</p>
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Qtd',
      accessorKey: 'quantity',
      sortable: true,
    },
    {
      id: 'totalPrice',
      header: 'Total',
      accessorKey: 'totalPrice',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-green-600">
          R$ {row.totalPrice.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'paymentMethod',
      header: 'Pagamento',
      accessorKey: 'paymentMethod',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Dinheiro', value: 'cash' },
        { label: 'PIX', value: 'pix' },
      ],
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.paymentMethod === 'pix' ? (
            <CreditCard size={14} className="text-primary" />
          ) : (
            <Banknote size={14} className="text-green-600" />
          )}
          {paymentMethodLabels[row.paymentMethod]}
        </div>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Status',
      accessorKey: 'paymentStatus',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(paymentStatusConfig).map(([value, { label }]) => ({ label, value })),
      cell: (row) => {
        const config = paymentStatusConfig[row.paymentStatus];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'createdAt',
      header: 'Data',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSale(row);
            setDetailsOpen(true);
          }}
        >
          <Eye size={16} />
        </Button>
      ),
    },
  ];

  const handleRowClick = (sale: typeof mockSales[0]) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  // Summary stats
  const totalRevenue = mockSales.filter(s => s.paymentStatus === 'completed').reduce((sum, s) => sum + s.totalPrice, 0);
  const pendingSales = mockSales.filter(s => s.paymentStatus === 'pending').length;
  const totalSales = mockSales.length;
  const pixSales = mockSales.filter(s => s.paymentMethod === 'pix' && s.paymentStatus === 'completed').reduce((sum, s) => sum + s.totalPrice, 0);

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="text-primary" size={28} />
          <h1 className="text-3xl font-serif font-bold">Gerenciar Vendas</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{totalSales}</p>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-yellow-600">{pendingSales}</p>
              <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">R$ {pixSales.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Vendas via PIX</p>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={mockSales}
          columns={columns}
          searchPlaceholder="Buscar vendas..."
          searchableFields={['bookTitle', 'userName', 'userEmail']}
          onRowClick={handleRowClick}
          isAdmin
          onExport={() => console.log('Export sales')}
          idField="id"
          showViewToggle
          defaultView="table"
        />

        {/* Sale Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Detalhes da Venda #{selectedSale?.id}
              </DialogTitle>
              <DialogDescription>
                Informações completas sobre a venda
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Livro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedSale?.bookTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSale?.quantity}x R$ {selectedSale?.unitPrice.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedSale?.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedSale?.userEmail}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span>
                        {selectedSale && format(new Date(selectedSale.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Método de Pagamento:</span>
                      <div className="flex items-center gap-2">
                        {selectedSale?.paymentMethod === 'pix' ? (
                          <CreditCard size={14} className="text-primary" />
                        ) : (
                          <Banknote size={14} className="text-green-600" />
                        )}
                        {selectedSale && paymentMethodLabels[selectedSale.paymentMethod]}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedSale ? paymentStatusConfig[selectedSale.paymentStatus].variant : 'outline'}>
                        {selectedSale ? paymentStatusConfig[selectedSale.paymentStatus].label : ''}
                      </Badge>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-green-600 text-lg">
                        R$ {selectedSale?.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
