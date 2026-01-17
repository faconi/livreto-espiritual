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
import { useBookDrafts } from '@/contexts/BookDraftsContext';

// Database of real spiritist books for ISBN lookup simulation
const isbnDatabase: Record<string, { title: string; author: string; spiritAuthor?: string; publisher: string; year?: number; pages?: number }> = {
  '9788573285772': { title: 'Nosso Lar', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1944, pages: 289 },
  '9788573285888': { title: 'O Evangelho Segundo o Espiritismo', author: 'Allan Kardec', publisher: 'FEB', year: 1864, pages: 512 },
  '9788573286014': { title: 'O Livro dos Espíritos', author: 'Allan Kardec', publisher: 'FEB', year: 1857, pages: 480 },
  '9788573285819': { title: 'O Céu e o Inferno', author: 'Allan Kardec', publisher: 'FEB', year: 1865, pages: 384 },
  '9788573285826': { title: 'A Gênese', author: 'Allan Kardec', publisher: 'FEB', year: 1868, pages: 432 },
  '9788573285741': { title: 'O Livro dos Médiuns', author: 'Allan Kardec', publisher: 'FEB', year: 1861, pages: 496 },
  '9788573286038': { title: 'Missionários da Luz', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1945, pages: 336 },
  '9788573286045': { title: 'Obreiros da Vida Eterna', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1946, pages: 304 },
  '9788573285765': { title: 'No Mundo Maior', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1947, pages: 288 },
  '9788573285796': { title: 'Libertação', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1949, pages: 320 },
  '9788564463110': { title: 'Violetas na Janela', author: 'Vera Lúcia Marinzeck de Carvalho', spiritAuthor: 'Patrícia', publisher: 'Petit', year: 1993, pages: 224 },
  '9788577222278': { title: 'O Amor Venceu', author: 'Zíbia Gasparetto', spiritAuthor: 'Lucius', publisher: 'Vida & Consciência', year: 2003, pages: 288 },
  '9788577221516': { title: 'Ninguém é de Ninguém', author: 'Zíbia Gasparetto', spiritAuthor: 'Lucius', publisher: 'Vida & Consciência', year: 2000, pages: 312 },
  '9788573286052': { title: 'Paulo e Estêvão', author: 'Chico Xavier', spiritAuthor: 'Emmanuel', publisher: 'FEB', year: 1942, pages: 576 },
  '9788573286069': { title: 'Há Dois Mil Anos', author: 'Chico Xavier', spiritAuthor: 'Emmanuel', publisher: 'FEB', year: 1939, pages: 448 },
  '9788573286076': { title: 'Emmanuel', author: 'Chico Xavier', spiritAuthor: 'Emmanuel', publisher: 'FEB', year: 1938, pages: 256 },
  '9788573285802': { title: 'Entre a Terra e o Céu', author: 'Chico Xavier', spiritAuthor: 'André Luiz', publisher: 'FEB', year: 1954, pages: 304 },
  '9788598161099': { title: 'Memórias de um Suicida', author: 'Yvonne A. Pereira', spiritAuthor: 'Camilo Castelo Branco', publisher: 'FEB', year: 1955, pages: 528 },
  '9788573286083': { title: 'Renúncia', author: 'Chico Xavier', spiritAuthor: 'Emmanuel', publisher: 'FEB', year: 1944, pages: 336 },
};

// Simulated lookup - returns book data or null
const lookupISBN = async (isbn: string): Promise<{ title: string; author: string; spiritAuthor?: string; publisher: string; year?: number; pages?: number } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Clean ISBN (remove dashes)
  const cleanIsbn = isbn.replace(/-/g, '');
  
  // Check our database first
  if (isbnDatabase[cleanIsbn]) {
    return isbnDatabase[cleanIsbn];
  }
  
  // For unknown ISBNs, randomly decide if found (30% chance)
  if (Math.random() > 0.7) {
    return null;
  }
  
  // Generate realistic-looking spiritist book data for unknown ISBNs
  const authors = ['Chico Xavier', 'Divaldo Franco', 'Zíbia Gasparetto', 'Vera Lúcia Marinzeck'];
  const spirits = ['Emmanuel', 'André Luiz', 'Joanna de Ângelis', 'Patrícia', 'Lucius'];
  const publishers = ['FEB', 'Leal', 'Vida & Consciência', 'Petit', 'Ideal'];
  const titles = [
    'Luz Interior', 'Caminhos da Alma', 'Renovando Atitudes', 'Lições de Sabedoria',
    'O Despertar', 'Encontros na Eternidade', 'Palavras do Coração', 'Reflexões Espirituais'
  ];
  
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    spiritAuthor: spirits[Math.floor(Math.random() * spirits.length)],
    publisher: publishers[Math.floor(Math.random() * publishers.length)],
    year: 1990 + Math.floor(Math.random() * 34),
    pages: 200 + Math.floor(Math.random() * 300),
  };
};

export default function BookDrafts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { drafts, updateDraft, removeDraft, removeDrafts } = useBookDrafts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

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
    setProcessingIds(prev => [...prev, draft.id]);
    
    try {
      const bookData = await lookupISBN(draft.isbn || draft.barcode || '');
      
      if (bookData) {
        updateDraft(draft.id, { 
          status: 'found', 
          bookData: {
            title: bookData.title,
            author: bookData.author,
            spiritAuthor: bookData.spiritAuthor,
            publisher: bookData.publisher,
            year: bookData.year,
            pages: bookData.pages,
          }
        });
        toast({
          title: 'Dados encontrados',
          description: `"${bookData.title}" de ${bookData.author}`,
        });
      } else {
        updateDraft(draft.id, { 
          status: 'error', 
          errorMessage: 'ISBN não encontrado nas bases consultadas (buscaisbn.com.br, Amazon, Google Books)' 
        });
        toast({
          title: 'Livro não encontrado',
          description: 'Você pode preencher os dados manualmente.',
          variant: 'destructive',
        });
      }
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== draft.id));
    }
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

    let successCount = 0;
    let errorCount = 0;

    for (const draft of pendingDrafts) {
      try {
        const bookData = await lookupISBN(draft.isbn || draft.barcode || '');
        
        if (bookData) {
          updateDraft(draft.id, { 
            status: 'found', 
            bookData: {
              title: bookData.title,
              author: bookData.author,
              spiritAuthor: bookData.spiritAuthor,
              publisher: bookData.publisher,
              year: bookData.year,
              pages: bookData.pages,
            }
          });
          successCount++;
        } else {
          updateDraft(draft.id, { 
            status: 'error', 
            errorMessage: 'ISBN não encontrado' 
          });
          errorCount++;
        }
      } catch {
        updateDraft(draft.id, { 
          status: 'error', 
          errorMessage: 'Erro ao consultar bases de dados' 
        });
        errorCount++;
      }
    }

    setIsProcessing(false);
    toast({
      title: 'Processamento concluído',
      description: `${successCount} encontrados, ${errorCount} não encontrados`,
    });
  };

  const handleDelete = (id: string) => {
    removeDraft(id);
    setSelectedIds(prev => prev.filter(i => i !== id));
    toast({
      title: 'Rascunho removido',
      description: 'O rascunho foi excluído com sucesso.',
    });
  };

  const handleDeleteSelected = () => {
    removeDrafts(selectedIds);
    const count = selectedIds.length;
    setSelectedIds([]);
    toast({
      title: 'Rascunhos removidos',
      description: `${count} rascunhos foram excluídos.`,
    });
  };

  const handleEdit = (draft: BookDraft) => {
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
      case 'error': return <Badge variant="destructive">Não encontrado</Badge>;
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-4 sm:py-8 px-3 sm:px-4">
        <Button variant="ghost" asChild className="mb-4 sm:mb-6">
          <Link to="/admin/livros">
            <ArrowLeft size={18} className="mr-2" />
            Voltar para Livros
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={24} />
            <div>
              <h1 className="text-xl sm:text-3xl font-serif font-bold">Rascunhos de Livros</h1>
              <p className="text-sm text-muted-foreground">
                {drafts.length} rascunhos aguardando dados
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Excluir </span>({selectedIds.length})
              </Button>
            )}
            <Button size="sm" onClick={handleFillAll} disabled={isProcessing || drafts.length === 0}>
              {isProcessing ? (
                <Loader2 size={14} className="mr-1 sm:mr-2 animate-spin" />
              ) : (
                <Sparkles size={14} className="mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Preencher Todos via IA</span>
              <span className="sm:hidden">Preencher</span>
            </Button>
          </div>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <CardContent className="py-12 sm:py-16 text-center">
              <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Nenhum rascunho</h2>
              <p className="text-sm text-muted-foreground mb-4">
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
                  checked={selectedIds.length === drafts.length && drafts.length > 0}
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
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.includes(draft.id)}
                      onCheckedChange={() => toggleSelect(draft.id)}
                    />

                    {processingIds.includes(draft.id) ? (
                      <Loader2 size={16} className="animate-spin text-primary" />
                    ) : (
                      getStatusIcon(draft.status)
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm truncate">
                          {draft.isbn || draft.barcode}
                        </span>
                        {getStatusBadge(draft.status)}
                      </div>
                      {draft.status === 'found' && draft.bookData && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {draft.bookData.title} - {draft.bookData.author}
                          {draft.bookData.spiritAuthor && ` (${draft.bookData.spiritAuthor})`}
                        </p>
                      )}
                      {draft.status === 'error' && draft.errorMessage && (
                        <p className="text-sm text-destructive mt-1">
                          {draft.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-8 sm:ml-0">
                    {draft.status !== 'found' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFillSingle(draft)}
                        disabled={processingIds.includes(draft.id)}
                      >
                        {processingIds.includes(draft.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={14} className="mr-1" />
                            <span className="hidden sm:inline">Buscar</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(draft)}
                    >
                      <Edit size={14} className="mr-1" />
                      <span className="hidden sm:inline">Editar</span>
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
