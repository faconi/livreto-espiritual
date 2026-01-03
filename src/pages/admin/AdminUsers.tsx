import { useState } from 'react';
import { Users, BookMarked, ShoppingBag, StickyNote, Save } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock users with more data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@geec.com.br',
    fullName: 'Administrador GEEC',
    role: 'admin',
    phone: '31999999999',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    email: 'joao@email.com',
    fullName: 'João Silva',
    socialName: 'João',
    role: 'user',
    phone: '31988888888',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123 - Belo Horizonte/MG',
    createdAt: new Date('2023-06-20'),
    notes: 'Cliente frequente. Prefere livros de Allan Kardec.',
  },
  {
    id: '3',
    email: 'maria@email.com',
    fullName: 'Maria Santos',
    role: 'user',
    phone: '31977777777',
    createdAt: new Date('2023-08-10'),
  },
  {
    id: '4',
    email: 'pedro@email.com',
    fullName: 'Pedro Lima',
    role: 'user',
    phone: '31966666666',
    createdAt: new Date('2023-10-05'),
    notes: 'Devolveu livro danificado uma vez. Acompanhar próximos empréstimos.',
  },
];

// Mock user history
const mockUserHistory: Record<string, { loans: any[], purchases: any[] }> = {
  '2': {
    loans: [
      { id: 'l1', bookTitle: 'O Livro dos Espíritos', status: 'active', date: '2024-01-15', dueDate: '2024-01-30' },
      { id: 'l2', bookTitle: 'Nosso Lar', status: 'returned', date: '2023-12-01', returnedAt: '2023-12-14' },
      { id: 'l3', bookTitle: 'Paulo e Estêvão', status: 'returned', date: '2023-10-15', returnedAt: '2023-10-28' },
    ],
    purchases: [
      { id: 'p1', bookTitle: 'O Evangelho Segundo o Espiritismo', quantity: 1, total: 42, date: '2024-01-10' },
      { id: 'p2', bookTitle: 'Violetas na Janela', quantity: 2, total: 70, date: '2023-11-20' },
    ],
  },
  '3': {
    loans: [
      { id: 'l4', bookTitle: 'A Gênese', status: 'active', date: '2024-01-20', dueDate: '2024-02-04' },
    ],
    purchases: [],
  },
  '4': {
    loans: [],
    purchases: [
      { id: 'p3', bookTitle: 'O Livro dos Médiuns', quantity: 1, total: 47, date: '2024-01-05' },
    ],
  },
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const columns: ColumnDef<User>[] = [
    {
      id: 'fullName',
      header: 'Nome',
      accessorKey: 'fullName',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (row) => (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(row);
            setAdminNotes(row.notes || '');
            setDetailsOpen(true);
          }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatarUrl} />
            <AvatarFallback>{row.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.fullName}</p>
            {row.socialName && (
              <p className="text-xs text-muted-foreground">{row.socialName}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'phone',
      header: 'Telefone',
      accessorKey: 'phone',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'role',
      header: 'Perfil',
      accessorKey: 'role',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Usuário', value: 'user' },
      ],
      cell: (row) => (
        <Badge variant={row.role === 'admin' ? 'default' : 'secondary'}>
          {row.role === 'admin' ? 'Admin' : 'Usuário'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Cadastro',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      id: 'hasNotes',
      header: 'Notas',
      accessorFn: (row) => row.notes ? 'Sim' : 'Não',
      cell: (row) => row.notes ? (
        <StickyNote size={16} className="text-yellow-600" />
      ) : null,
    },
  ];

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setAdminNotes(user.notes || '');
    setDetailsOpen(true);
  };

  const handleSaveNotes = () => {
    // In real app, save to backend
    toast({
      title: 'Notas salvas',
      description: 'As anotações do usuário foram atualizadas.',
    });
  };

  const userHistory = selectedUser ? mockUserHistory[selectedUser.id] : null;

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-primary" size={28} />
          <h1 className="text-3xl font-serif font-bold">Gerenciar Usuários</h1>
        </div>

        <DataTable
          data={mockUsers}
          columns={columns}
          searchPlaceholder="Buscar usuários..."
          searchableFields={['fullName', 'email', 'phone']}
          onRowClick={handleRowClick}
          isAdmin
          onExport={() => console.log('Export users')}
          onImport={(file) => console.log('Import users', file)}
          idField="id"
          showViewToggle
          defaultView="table"
        />

        {/* User Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser?.avatarUrl} />
                  <AvatarFallback>{selectedUser?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xl">{selectedUser?.fullName}</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    {selectedUser?.email}
                  </p>
                </div>
              </DialogTitle>
              <DialogDescription>
                Detalhes e histórico do usuário
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 py-4">
                {/* User Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome completo:</span>
                        <span>{selectedUser?.fullName}</span>
                      </div>
                      {selectedUser?.socialName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome social:</span>
                          <span>{selectedUser.socialName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedUser?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span>{selectedUser?.phone || '-'}</span>
                      </div>
                      {selectedUser?.cpf && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPF:</span>
                          <span>{selectedUser.cpf}</span>
                        </div>
                      )}
                      {selectedUser?.address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="text-right max-w-[200px]">{selectedUser.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Resumo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Perfil:</span>
                        <Badge variant={selectedUser?.role === 'admin' ? 'default' : 'secondary'}>
                          {selectedUser?.role === 'admin' ? 'Admin' : 'Usuário'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cadastrado em:</span>
                        <span>
                          {selectedUser?.createdAt && format(new Date(selectedUser.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empréstimos:</span>
                        <span>{userHistory?.loans?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compras:</span>
                        <span>{userHistory?.purchases?.length || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Admin Notes - CRM */}
                <Card className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <StickyNote size={16} className="text-yellow-600" />
                      Anotações do Administrador (Privado)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Adicione observações sobre este cliente..."
                      rows={4}
                      className="bg-white"
                    />
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={handleSaveNotes}
                    >
                      <Save size={14} className="mr-2" />
                      Salvar Notas
                    </Button>
                  </CardContent>
                </Card>

                <Separator />

                {/* Loan History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookMarked size={16} />
                      Histórico de Empréstimos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userHistory?.loans && userHistory.loans.length > 0 ? (
                      <div className="space-y-3">
                        {userHistory.loans.map((loan) => (
                          <div 
                            key={loan.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{loan.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Emprestado em {loan.date}
                                {loan.status === 'active' && ` • Devolução: ${loan.dueDate}`}
                                {loan.status === 'returned' && ` • Devolvido: ${loan.returnedAt}`}
                              </p>
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

                {/* Purchase History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingBag size={16} />
                      Histórico de Compras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userHistory?.purchases && userHistory.purchases.length > 0 ? (
                      <div className="space-y-3">
                        {userHistory.purchases.map((purchase) => (
                          <div 
                            key={purchase.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{purchase.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {purchase.quantity}x em {purchase.date}
                              </p>
                            </div>
                            <span className="font-medium text-green-600">
                              R$ {purchase.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma compra registrada
                      </p>
                    )}
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
