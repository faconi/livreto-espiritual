import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingBag, 
  BookMarked,
  TrendingUp,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockBooks } from '@/data/mockBooks';

const stats = [
  {
    title: 'Total de Livros',
    value: mockBooks.length,
    icon: BookOpen,
    change: '+3 este mês',
    href: '/admin/livros',
  },
  {
    title: 'Usuários Cadastrados',
    value: 127,
    icon: Users,
    change: '+12 este mês',
    href: '/admin/usuarios',
  },
  {
    title: 'Empréstimos Ativos',
    value: 34,
    icon: BookMarked,
    change: '5 vencendo',
    href: '/admin/emprestimos',
  },
  {
    title: 'Vendas do Mês',
    value: 'R$ 1.234',
    icon: ShoppingBag,
    change: '+15% vs anterior',
    href: '/admin/vendas',
  },
];

const recentActivities = [
  { id: 1, type: 'loan', message: 'João Silva emprestou "O Livro dos Espíritos"', time: 'Há 2 horas' },
  { id: 2, type: 'sale', message: 'Maria Santos comprou "Nosso Lar"', time: 'Há 4 horas' },
  { id: 3, type: 'return', message: 'Pedro Lima devolveu "Paulo e Estêvão"', time: 'Há 5 horas' },
  { id: 4, type: 'user', message: 'Novo usuário cadastrado: Ana Oliveira', time: 'Há 1 dia' },
];

const pendingReturns = [
  { id: 1, user: 'Carlos Mendes', book: 'O Evangelho Segundo o Espiritismo', requestedAt: 'Há 1 dia' },
  { id: 2, user: 'Lucia Ferreira', book: 'A Gênese', requestedAt: 'Há 2 dias' },
];

export default function AdminDashboard() {
  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              <LayoutDashboard className="text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a biblioteca e livraria
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/livros/novo">
              <Plus size={18} className="mr-2" />
              Novo Livro
            </Link>
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                      <stat.icon size={20} className="text-primary-foreground" />
                    </div>
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending returns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-warning" size={20} />
                Devoluções Pendentes
              </CardTitle>
              <Badge variant="secondary">{pendingReturns.length}</Badge>
            </CardHeader>
            <CardContent>
              {pendingReturns.length > 0 ? (
                <div className="space-y-4">
                  {pendingReturns.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.book}</p>
                        <p className="text-sm text-muted-foreground">{item.user}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{item.requestedAt}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">Recusar</Button>
                          <Button size="sm">Aceitar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma devolução pendente
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'loan' ? 'bg-blue-500' :
                      activity.type === 'sale' ? 'bg-green-500' :
                      activity.type === 'return' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <Link to="/admin/livros">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <BookOpen size={24} className="text-primary" />
                <div>
                  <p className="font-semibold">Gerenciar Livros</p>
                  <p className="text-sm text-muted-foreground">Cadastro e estoque</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/usuarios">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <Users size={24} className="text-primary" />
                <div>
                  <p className="font-semibold">Gerenciar Usuários</p>
                  <p className="text-sm text-muted-foreground">Clientes e histórico</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/emprestimos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <BookMarked size={24} className="text-primary" />
                <div>
                  <p className="font-semibold">Empréstimos</p>
                  <p className="text-sm text-muted-foreground">Controle e devoluções</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
