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
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBooks } from '@/hooks/useBooks';
import { useUsers } from '@/hooks/useUsers';
import { useLoansAdmin } from '@/hooks/useLoans';
import { useSalesAdmin } from '@/hooks/useSales';
import { usePendingConfirmations } from '@/hooks/usePendingConfirmations';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const { books, isLoading: booksLoading } = useBooks();
  const { users, isLoading: usersLoading } = useUsers();
  const { loans, isLoading: loansLoading } = useLoansAdmin();
  const { sales, isLoading: salesLoading } = useSalesAdmin();
  const { pendingItems, isLoading: pendingLoading } = usePendingConfirmations();

  const isLoading = booksLoading || usersLoading || loansLoading || salesLoading || pendingLoading;

  // Calculate stats
  const activeLoansCount = useMemo(() => 
    loans.filter(l => l.status !== 'returned').length,
  [loans]);

  const overdueLoansCount = useMemo(() => 
    loans.filter(l => l.status === 'overdue').length,
  [loans]);

  const monthSalesTotal = useMemo(() => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return sales
      .filter(s => s.paymentStatus === 'completed' && new Date(s.createdAt) >= firstOfMonth)
      .reduce((sum, s) => sum + s.totalPrice, 0);
  }, [sales]);

  // Pending confirmations summary
  const pendingSummary = useMemo(() => ({
    returns: pendingItems.filter(p => p.type === 'loan_return').length,
    renewals: pendingItems.filter(p => p.type === 'loan_renewal').length,
    payments: pendingItems.filter(p => p.type === 'payment').length,
    loanRequests: pendingItems.filter(p => p.type === 'loan_request').length,
  }), [pendingItems]);

  // Recent activities from loans and sales
  const recentActivities = useMemo(() => {
    const activities: { id: string; type: string; message: string; time: Date }[] = [];

    // Get recent loans
    loans.slice(0, 3).forEach(loan => {
      activities.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        message: `${loan.userName} emprestou "${loan.bookTitle}"`,
        time: new Date(loan.borrowedAt),
      });
    });

    // Get recent sales
    sales.slice(0, 3).forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        message: `${sale.userName} comprou "${sale.bookTitle}"`,
        time: new Date(sale.createdAt),
      });
    });

    // Sort by time and take top 4
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 4)
      .map(a => ({
        ...a,
        timeFormatted: formatRelativeTime(a.time),
      }));
  }, [loans, sales]);

  const stats = [
    {
      title: 'Total de Livros',
      value: books.length,
      icon: BookOpen,
      change: `${books.filter(b => b.availableForLoan > 0).length} disponíveis`,
      href: '/admin/livros',
    },
    {
      title: 'Usuários Cadastrados',
      value: users.length,
      icon: Users,
      change: 'Ver todos',
      href: '/admin/usuarios',
    },
    {
      title: 'Empréstimos Ativos',
      value: activeLoansCount,
      icon: BookMarked,
      change: overdueLoansCount > 0 ? `${overdueLoansCount} atrasados` : 'Todos em dia',
      href: '/admin/emprestimos',
    },
    {
      title: 'Vendas do Mês',
      value: `R$ ${monthSalesTotal.toFixed(2).replace('.', ',')}`,
      icon: ShoppingBag,
      change: `${sales.filter(s => s.paymentStatus === 'completed').length} vendas`,
      href: '/admin/vendas',
    },
  ];

  if (isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                    <TrendingUp size={14} className="sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{stat.title}</p>
                  <p className="text-[10px] sm:text-xs text-primary mt-0.5 sm:mt-1">{stat.change}</p>
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
                  {pendingItems.length}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RotateCcw size={14} className="sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm">Devoluções</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.returns}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RefreshCw size={14} className="sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm">Renovações</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.renewals}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CreditCard size={14} className="sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm">Pagamentos</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{pendingSummary.payments}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BookMarked size={14} className="sm:w-4 sm:h-4 text-primary" />
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
              {recentActivities.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b last:border-0"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                        activity.type === 'loan' ? 'bg-primary' :
                        activity.type === 'sale' ? 'bg-primary' :
                        activity.type === 'return' ? 'bg-primary' :
                        'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm line-clamp-2">{activity.message}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.timeFormatted}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR');
}
