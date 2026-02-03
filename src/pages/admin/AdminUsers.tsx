import { useState } from 'react';
import { Users, BookMarked, ShoppingBag, StickyNote, Save, Pencil, MessageSquare, AlertCircle, Send, X, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from '@/hooks/useUsers';

// Mock user history (will be replaced with real data later)
const mockUserHistory: Record<string, { loans: any[], purchases: any[], pendingActions: any[] }> = {};

// Mock messages (will be replaced with real data later)
const mockMessages: Record<string, any[]> = {};

export default function AdminUsers() {
  const { toast } = useToast();
  const { users, isLoading, updateUser, setUserRole } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [activeTab, setActiveTab] = useState('info');

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
            handleOpenUser(row);
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

  const handleOpenUser = (user: User) => {
    setSelectedUser(user);
    setAdminNotes(user.notes || '');
    setEditedUser(user);
    setEditMode(false);
    setActiveTab('info');
    setDetailsOpen(true);
  };

  const handleRowClick = (user: User) => {
    handleOpenUser(user);
  };

  const handleSaveNotes = () => {
    if (!selectedUser) return;
    // Notes functionality - for now just update local state
    // TODO: Add admin_notes field to profiles table
    toast({
      title: 'Notas salvas',
      description: 'As anotações do usuário foram atualizadas.',
    });
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    updateUser.mutate({ 
      id: selectedUser.id, 
      updates: editedUser 
    });
    setSelectedUser({ ...selectedUser, ...editedUser } as User);
    setEditMode(false);
  };

  const handleSendMessage = () => {
    if (!selectedUser || !newMessage.trim()) return;
    
    const newMsg = {
      id: `m${Date.now()}`,
      from: 'admin',
      content: newMessage,
      date: new Date().toISOString(),
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMsg],
    }));
    setNewMessage('');
    toast({
      title: 'Mensagem enviada',
      description: 'A mensagem foi enviada para o usuário.',
    });
  };

  const userHistory = selectedUser ? mockUserHistory[selectedUser.id] : null;
  const userMessages = selectedUser ? messages[selectedUser.id] || [] : [];

  if (isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="container py-4 sm:py-8 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="text-primary" size={24} />
          <h1 className="text-xl sm:text-3xl font-serif font-bold">Gerenciar Usuários</h1>
        </div>

        <DataTable
          data={users}
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
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={selectedUser?.avatarUrl} />
                  <AvatarFallback>{selectedUser?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-lg sm:text-xl">{selectedUser?.fullName}</span>
                  <p className="text-sm text-muted-foreground font-normal truncate">
                    {selectedUser?.email}
                  </p>
                </div>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </Button>
                )}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes e histórico do usuário
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" className="text-xs sm:text-sm">Dados</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">Histórico</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  Pendências
                  {userHistory?.pendingActions?.length ? (
                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                      {userHistory.pendingActions.length}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="messages" className="text-xs sm:text-sm">Mensagens</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                {/* Info Tab */}
                <TabsContent value="info" className="m-0 space-y-4">
                  {editMode ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Editar Dados</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Nome Completo</label>
                            <Input 
                              value={editedUser.fullName || ''} 
                              onChange={e => setEditedUser({ ...editedUser, fullName: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Nome Social</label>
                            <Input 
                              value={editedUser.socialName || ''} 
                              onChange={e => setEditedUser({ ...editedUser, socialName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input 
                              value={editedUser.email || ''} 
                              onChange={e => setEditedUser({ ...editedUser, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Telefone</label>
                            <Input 
                              value={editedUser.phone || ''} 
                              onChange={e => setEditedUser({ ...editedUser, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">CPF</label>
                            <Input 
                              value={editedUser.cpf || ''} 
                              onChange={e => setEditedUser({ ...editedUser, cpf: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Perfil</label>
                            <Select 
                              value={editedUser.role} 
                              onValueChange={(v) => setEditedUser({ ...editedUser, role: v as 'user' | 'admin' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Endereço</label>
                          <Textarea 
                            value={editedUser.address || ''} 
                            onChange={e => setEditedUser({ ...editedUser, address: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditMode(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveUser}>
                            <Save size={14} className="mr-2" />
                            Salvar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
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
                            <span className="truncate max-w-[180px]">{selectedUser?.email}</span>
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
                              <span className="text-right max-w-[180px]">{selectedUser.address}</span>
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
                  )}

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
                        rows={3}
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
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="m-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookMarked size={16} />
                        Histórico de Empréstimos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userHistory?.loans && userHistory.loans.length > 0 ? (
                        <div className="space-y-2">
                          {userHistory.loans.map((loan) => (
                            <div 
                              key={loan.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">{loan.bookTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {loan.date}
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
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          Nenhum empréstimo registrado
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ShoppingBag size={16} />
                        Histórico de Compras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userHistory?.purchases && userHistory.purchases.length > 0 ? (
                        <div className="space-y-2">
                          {userHistory.purchases.map((purchase) => (
                            <div 
                              key={purchase.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">{purchase.bookTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {purchase.quantity}x em {purchase.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                                  {purchase.status === 'completed' ? 'Pago' : 'Pendente'}
                                </Badge>
                                <span className="font-medium text-green-600">
                                  R$ {purchase.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          Nenhuma compra registrada
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pending Actions Tab */}
                <TabsContent value="pending" className="m-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle size={16} className="text-yellow-600" />
                        Pendências do Usuário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userHistory?.pendingActions && userHistory.pendingActions.length > 0 ? (
                        <div className="space-y-2">
                          {userHistory.pendingActions.map((action) => (
                            <div 
                              key={action.id}
                              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">{action.bookTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {action.type === 'loan_return' && 'Devolução pendente'}
                                  {action.type === 'payment' && `Pagamento pendente: R$ ${action.amount?.toFixed(2)}`}
                                  {' • '}{action.requestedAt}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">
                                Gerenciar
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle size={32} className="mx-auto text-green-500 mb-2" />
                          <p className="text-sm font-medium">Tudo em dia!</p>
                          <p className="text-xs text-muted-foreground">
                            Este usuário não tem pendências.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="m-0">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare size={16} />
                        Mensagens
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScrollArea className="h-[200px] border rounded-lg p-3">
                        {userMessages.length > 0 ? (
                          <div className="space-y-3">
                            {userMessages.map((msg) => (
                              <div 
                                key={msg.id}
                                className={`p-2 rounded-lg max-w-[80%] ${
                                  msg.from === 'admin' 
                                    ? 'bg-primary/10 ml-auto' 
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {format(new Date(msg.date), "dd/MM HH:mm")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            Nenhuma mensagem
                          </div>
                        )}
                      </ScrollArea>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Digite uma mensagem..."
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
