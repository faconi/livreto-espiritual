import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity,
  Clock,
  BookOpen,
  ShoppingBag,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Activity as ActivityType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Activities will come from context in real implementation
import { useActivity } from '@/contexts/ActivityContext';

// Mock alerts (pending items, failed payments, etc.)
const mockAlerts = [
  {
    id: 'alert1',
    type: 'payment_pending',
    title: 'Pagamento pendente',
    description: 'Compra de "O Evangelho Segundo o Espiritismo" aguardando pagamento',
    actionUrl: '/carrinho',
    createdAt: new Date('2024-01-10'),
  },
];

const activityIcons: Record<ActivityType['type'], any> = {
  loan_request: BookOpen,
  loan_confirmed: CheckCircle,
  loan_return_requested: RotateCcw,
  loan_returned: CheckCircle,
  loan_renewal_requested: RefreshCw,
  loan_renewed: CheckCircle,
  purchase: ShoppingBag,
  payment_pending: Clock,
  payment_completed: CheckCircle,
  payment_failed: XCircle,
  wishlist_add: Heart,
  wishlist_remove: Heart,
  message_sent: MessageSquare,
  message_received: MessageSquare,
};

const activityColors: Record<ActivityType['type'], string> = {
  loan_request: 'bg-blue-100 text-blue-600',
  loan_confirmed: 'bg-green-100 text-green-600',
  loan_return_requested: 'bg-yellow-100 text-yellow-600',
  loan_returned: 'bg-green-100 text-green-600',
  loan_renewal_requested: 'bg-orange-100 text-orange-600',
  loan_renewed: 'bg-green-100 text-green-600',
  purchase: 'bg-purple-100 text-purple-600',
  payment_pending: 'bg-yellow-100 text-yellow-600',
  payment_completed: 'bg-green-100 text-green-600',
  payment_failed: 'bg-red-100 text-red-600',
  wishlist_add: 'bg-pink-100 text-pink-600',
  wishlist_remove: 'bg-gray-100 text-gray-600',
  message_sent: 'bg-blue-100 text-blue-600',
  message_received: 'bg-indigo-100 text-indigo-600',
};

export default function MyActivities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities } = useActivity();
  const [filter, setFilter] = useState<'all' | 'loans' | 'purchases' | 'messages'>('all');

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    if (filter === 'loans') return activities.filter(a => 
      a.type.startsWith('loan_')
    );
    if (filter === 'purchases') return activities.filter(a => 
      a.type === 'purchase' || a.type.startsWith('payment_')
    );
    if (filter === 'messages') return activities.filter(a => 
      a.type.startsWith('message_')
    );
    return activities;
  }, [filter, activities]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityType[]> = {};
    filteredActivities.forEach(activity => {
      const dateKey = format(activity.createdAt, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              <Activity className="text-primary" />
              Minhas Atividades
            </h1>
            <p className="text-muted-foreground mt-1">
              Timeline de todas as suas ações no sistema
            </p>
          </div>

          {/* Alerts */}
          {mockAlerts.length > 0 && (
            <div className="space-y-3">
              {mockAlerts.map(alert => (
                <Card 
                  key={alert.id} 
                  className="border-yellow-300 bg-yellow-50 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(alert.actionUrl)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900">{alert.title}</p>
                      <p className="text-sm text-yellow-700">{alert.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Resolver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button 
              variant={filter === 'loans' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('loans')}
            >
              <BookOpen size={14} className="mr-1" />
              Empréstimos
            </Button>
            <Button 
              variant={filter === 'purchases' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('purchases')}
            >
              <ShoppingBag size={14} className="mr-1" />
              Compras
            </Button>
            <Button 
              variant={filter === 'messages' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('messages')}
            >
              <MessageSquare size={14} className="mr-1" />
              Mensagens
            </Button>
          </div>

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {Object.entries(groupedActivities).map(([date, activities]) => (
                    <div key={date}>
                      <p className="text-sm font-medium text-muted-foreground mb-4">
                        {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <div className="space-y-4 pl-4 border-l-2 border-muted">
                        {activities.map(activity => {
                          const Icon = activityIcons[activity.type];
                          const colorClass = activityColors[activity.type];
                          
                          return (
                            <div 
                              key={activity.id}
                              className="relative pl-6 cursor-pointer group"
                              onClick={() => activity.actionUrl && navigate(activity.actionUrl)}
                            >
                              {/* Timeline dot */}
                              <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${colorClass} flex items-center justify-center ring-4 ring-background`}>
                                <div className="h-2 w-2 rounded-full bg-current" />
                              </div>
                              
                              <div className="bg-muted/50 rounded-lg p-4 group-hover:bg-muted transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className={`h-8 w-8 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                                    <Icon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{activity.title}</p>
                                      {activity.isAlert && (
                                        <Badge variant="destructive" className="text-xs">
                                          Ação necessária
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {format(activity.createdAt, "HH:mm", { locale: ptBR })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {Object.keys(groupedActivities).length === 0 && (
                    <div className="text-center py-12">
                      <Activity size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
