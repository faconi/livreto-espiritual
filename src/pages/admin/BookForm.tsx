import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Save,
  ImagePlus,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { categories, publishers, mockBooks } from '@/data/mockBooks';
import { Link } from 'react-router-dom';

const bookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  author: z.string().min(1, 'Autor (Médium) é obrigatório'),
  spiritAuthor: z.string().optional(),
  publisher: z.string().min(1, 'Editora é obrigatória'),
  category: z.string().optional(),
  edition: z.string().optional(),
  year: z.string().optional(),
  pages: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  tags: z.string().optional(),
  
  quantityForLoan: z.string(),
  quantityForSale: z.string(),
  
  acquisitionPrice: z.string().optional(),
  salePrice: z.string().optional(),
  suggestedMargin: z.string().optional(),
  discount: z.string().optional(),
  isDonation: z.boolean().default(false),
  
  invoiceNumber: z.string().optional(),
  acquisitionDate: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isEditing = !!id;

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      isbn: '',
      title: '',
      author: '',
      spiritAuthor: '',
      publisher: '',
      category: '',
      edition: '',
      year: '',
      pages: '',
      description: '',
      coverUrl: '',
      tags: '',
      quantityForLoan: '0',
      quantityForSale: '0',
      acquisitionPrice: '',
      salePrice: '',
      suggestedMargin: '80',
      discount: '0',
      isDonation: false,
      invoiceNumber: '',
      acquisitionDate: '',
    },
  });

  // Load book data when editing
  useEffect(() => {
    if (isEditing && id) {
      const book = mockBooks.find(b => b.id === id);
      if (book) {
        form.reset({
          isbn: book.isbn || '',
          title: book.title,
          author: book.author,
          spiritAuthor: book.spiritAuthor || '',
          publisher: book.publisher,
          category: book.category || '',
          edition: book.edition || '',
          year: book.year?.toString() || '',
          pages: book.pages?.toString() || '',
          description: book.description || '',
          coverUrl: book.coverUrl || '',
          tags: book.tags?.join(', ') || '',
          quantityForLoan: book.quantityForLoan.toString(),
          quantityForSale: book.quantityForSale.toString(),
          acquisitionPrice: book.acquisitionPrice?.toString() || '',
          salePrice: book.salePrice?.toString() || '',
          suggestedMargin: book.suggestedMargin?.toString() || '80',
          discount: book.discount?.toString() || '0',
          isDonation: book.isDonation || false,
          invoiceNumber: book.invoiceNumber || '',
          acquisitionDate: book.acquisitionDate 
            ? new Date(book.acquisitionDate).toISOString().split('T')[0] 
            : '',
        });
      }
    }
  }, [id, isEditing, form]);

  const acquisitionPrice = parseFloat(form.watch('acquisitionPrice') || '0');
  const suggestedMargin = parseFloat(form.watch('suggestedMargin') || '80');
  const salePrice = parseFloat(form.watch('salePrice') || '0');
  const discount = parseFloat(form.watch('discount') || '0');

  const suggestedSalePrice = acquisitionPrice * (1 + suggestedMargin / 100);
  const finalPrice = salePrice * (1 - discount / 100);
  const actualMargin = salePrice > 0 && acquisitionPrice > 0 
    ? ((salePrice - acquisitionPrice) / acquisitionPrice) * 100 
    : 0;

  const handleSearchISBN = async () => {
    const isbn = form.getValues('isbn');
    if (!isbn) {
      toast({
        title: 'ISBN necessário',
        description: 'Digite o ISBN para buscar informações.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - in production would call ISBN APIs
    toast({
      title: 'Busca realizada',
      description: 'Em produção, buscaria em buscaisbn.com.br, Amazon, etc.',
    });
    
    // Fill mock data
    form.setValue('title', 'Livro Exemplo');
    form.setValue('author', 'Autor Exemplo');
    form.setValue('publisher', 'FEB');
    
    setIsSearching(false);
  };

  const applySuggestedPrice = () => {
    form.setValue('salePrice', suggestedSalePrice.toFixed(2));
  };

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: isEditing ? 'Livro atualizado!' : 'Livro cadastrado!',
      description: `"${data.title}" foi ${isEditing ? 'atualizado' : 'adicionado ao acervo'}.`,
    });
    
    navigate('/admin/livros');
    setIsLoading(false);
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/admin/livros">
            <ArrowLeft size={18} className="mr-2" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-serif font-bold mb-8">
          {isEditing ? 'Editar Livro' : 'Cadastrar Novo Livro'}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ISBN Search */}
            <Card>
              <CardHeader>
                <CardTitle>Busca por ISBN</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Digite o ISBN ou código de barras" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleSearchISBN}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search size={18} className="mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Busca automática em buscaisbn.com.br, Amazon e outras fontes
                </p>
              </CardContent>
            </Card>

            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Livro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autor (Médium) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Chico Xavier, Zíbia Gasparetto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spiritAuthor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espírito Autor</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: André Luiz, Emmanuel" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Editora *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {publishers.map(pub => (
                              <SelectItem key={pub} value={pub}>{pub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="edition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edição</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1ª, 2ª revista" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Páginas</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição / Resumo</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Romance, Ética, Filosofia (separadas por vírgula)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separe as tags por vírgula para facilitar a busca
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Capa</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <Button type="button" variant="outline">
                          <ImagePlus size={18} className="mr-2" />
                          Upload
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantityForLoan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade para Empréstimo</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantityForSale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade para Venda</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Precificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="acquisitionPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Aquisição (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="suggestedMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margem Sugerida (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="200" {...field} />
                        </FormControl>
                        <FormDescription>
                          Preço sugerido: R$ {suggestedSalePrice.toFixed(2)}
                          <Button 
                            type="button" 
                            variant="link" 
                            size="sm"
                            className="ml-2 h-auto p-0"
                            onClick={applySuggestedPrice}
                          >
                            <Calculator size={14} className="mr-1" />
                            Aplicar
                          </Button>
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        {actualMargin > 0 && (
                          <FormDescription>
                            Margem real: {actualMargin.toFixed(1)}%
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desconto (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        {discount > 0 && salePrice > 0 && (
                          <FormDescription>
                            Preço final: R$ {finalPrice.toFixed(2)}
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isDonation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Marcar como Doação</FormLabel>
                        <FormDescription>
                          Livros de doação são destacados no catálogo
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Acquisition info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Aquisição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número da Nota Fiscal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="acquisitionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Aquisição</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/livros')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Livro'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
