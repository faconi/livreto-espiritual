import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Edit, 
  Sparkles, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BookDraft } from '@/types';

// Mock drafts data
const initialDrafts: BookDraft[] = [
  { id: '1', isbn: '9788573285772', status: 'pending', createdAt: new Date() },
  { id: '2', isbn: '9788573285888', status: 'found', createdAt: new Date(), bookData: { title: 'O Evangelho Segundo o Espiritismo', author: 'Allan Kardec' } },
  { id: '3', isbn: '9788573286014', status: 'error', createdAt: new Date(), errorMessage: 'ISBN não encontrado nas bases consultadas' },
];

export default function BookDrafts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<BookDraft[]>(initialDrafts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === drafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(drafts.map(d => d.id));
    }
  };

  const handleFillSingle = async (draft: BookDraft) => {
    setDrafts(prev => prev.map(d => 
      d.id === draft.id ? { ...d, status: 'pending' as const } : d
    ));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure
    const success = Math.random() > 0.3;
    setDrafts(prev => prev.map(d => 
      d.id === draft.id 
        ? success 
          ? { ...d, status: 'found' as const, bookData: { title: 'Livro Encontrado', author: 'Autor' } }
          : { ...d, status: 'error' as const, errorMessage: 'Não encontrado' }
        : d
    ));

    toast({
      title: success ? 'Dados encontrados' : 'Falha na busca',
      description: success ? 'Os dados do livro foram preenchidos.' : 'Não foi possível encontrar os dados.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleFillAll = async () => {
    const pendingDrafts = drafts.filter(d => d.status === 'pending' || d.status === 'error');
    if (pendingDrafts.length === 0) {
      toast({
        title: 'Nenhum rascunho pendente',
        description: 'Todos os rascunhos já foram processados.',
      });
      return;
    }

    setIsProcessing(true);

    for (const draft of pendingDrafts) {
      await handleFillSingle(draft);
    }

    setIsProcessing(false);
    toast({
      title: 'Processamento concluído',
      description: `${pendingDrafts.length} rascunhos foram processados.`,
    });
  };

  const handleDelete = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    toast({
      title: 'Rascunho removido',
      description: 'O rascunho foi excluído com sucesso.',
    });
  };

  const handleDeleteSelected = () => {
    setDrafts(prev => prev.filter(d => !selectedIds.includes(d.id)));
    setSelectedIds([]);
    toast({
      title: 'Rascunhos removidos',
      description: `${selectedIds.length} rascunhos foram excluídos.`,
    });
  };

  const handleEdit = (draft: BookDraft) => {
    // Navigate to book form with pre-filled data
    navigate('/admin/livros/novo', { state: { draft } });
  };

  const getStatusIcon = (status: BookDraft['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'found': return <CheckCircle size={16} className="text-green-500" />;
      case 'error': return <XCircle size={16} className="text-destructive" />;
    }
  };

  const getStatusBadge = (status: BookDraft['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Aguardando</Badge>;
      case 'found': return <Badge className="bg-green-500">Dados encontrados</Badge>;
      case 'error': return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/admin/livros">
            <ArrowLeft size={18} className="mr-2" />
            Voltar para Livros
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={28} />
            <div>
              <h1 className="text-3xl font-serif font-bold">Rascunhos de Livros</h1>
              <p className="text-muted-foreground">
                {drafts.length} rascunhos aguardando dados
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 size={16} className="mr-2" />
                Excluir ({selectedIds.length})
              </Button>
            )}
            <Button onClick={handleFillAll} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              Preencher Todos via IA
            </Button>
          </div>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum rascunho</h2>
              <p className="text-muted-foreground mb-4">
                Use o scanner de códigos de barras para adicionar novos livros.
              </p>
              <Button asChild>
                <Link to="/admin/livros">Ir para Gerenciar Livros</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length === drafts.length}
                  onCheckedChange={toggleSelectAll}
                />
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Selecionar todos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {drafts.map(draft => (
                <div 
                  key={draft.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(draft.id)}
                    onCheckedChange={() => toggleSelect(draft.id)}
                  />

                  {getStatusIcon(draft.status)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {draft.isbn || draft.barcode}
                      </span>
                      {getStatusBadge(draft.status)}
                    </div>
                    {draft.status === 'found' && draft.bookData && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {draft.bookData.title} - {draft.bookData.author}
                      </p>
                    )}
                    {draft.status === 'error' && draft.errorMessage && (
                      <p className="text-sm text-destructive mt-1">
                        {draft.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {draft.status !== 'found' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFillSingle(draft)}
                      >
                        <Sparkles size={14} className="mr-1" />
                        Buscar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(draft)}
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(draft.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
