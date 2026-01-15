import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingBag, 
  BookMarked,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  CreditCard,
  RotateCcw
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

// Mock pending confirmations summary
const pendingSummary = {
  returns: 3,
  renewals: 2,
  payments: 1,
  loanRequests: 4,
};

export default function AdminDashboard() {
  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2 sm:gap-3">
            <LayoutDashboard className="text-primary w-6 h-6 sm:w-auto sm:h-auto" />
            Painel Administrativo
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie a biblioteca e livraria
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center">
                      <stat.icon size={16} className="sm:w-5 sm:h-5 text-primary-foreground" />
                    </div>
                    <TrendingUp size={14} className="sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{stat.title}</p>
                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Pending Confirmations Card */}
          <Link to="/admin/pendencias">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ClipboardList className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Confirmações Pendentes</span>
                  <span className="xs:hidden">Pendências</span>
                </CardTitle>
                <Badge className="text-xs">
                  {pendingSummary.returns + pendingSummary.renewals + pendingSummary.payments + pendingSummary.loanRequests}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RotateCcw size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-xs sm:text-sm">Devoluções</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.returns}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RefreshCw size={14} className="sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm">Renovações</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.renewals}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CreditCard size={14} className="sm:w-4 sm:h-4 text-green-500" />
                      <span className="text-xs sm:text-sm">Pagamentos</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.payments}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BookMarked size={14} className="sm:w-4 sm:h-4 text-purple-500" />
                      <span className="text-xs sm:text-sm">Empréstimos</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.loanRequests}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Recent activity */}
          <Card className="h-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                      activity.type === 'loan' ? 'bg-blue-500' :
                      activity.type === 'sale' ? 'bg-green-500' :
                      activity.type === 'return' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm line-clamp-2">{activity.message}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
