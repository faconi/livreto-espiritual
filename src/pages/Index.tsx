import { Link } from 'react-router-dom';
import { BookOpen, Users, ShoppingBag, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockBooks } from '@/data/mockBooks';

const features = [
  {
    icon: BookOpen,
    title: 'Biblioteca Espírita',
    description: 'Amplo acervo de obras espíritas para empréstimo gratuito',
  },
  {
    icon: ShoppingBag,
    title: 'Livraria',
    description: 'Adquira livros espíritas com preços acessíveis',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Faça parte da nossa família espírita há 45 anos',
  },
  {
    icon: Heart,
    title: 'Caridade',
    description: 'Parte da renda é revertida para ações sociais',
  },
];

export default function Index() {
  const { user } = useAuth();
  const featuredBooks = mockBooks.slice(0, 4);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)),transparent_50%)]" />
        </div>
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles size={16} />
              Há mais de 45 anos difundindo o Espiritismo
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
              Biblioteca e Livraria
              <span className="text-gradient block mt-2">Evangelho de Cristo</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra obras espíritas que iluminam caminhos. 
              Empreste ou adquira livros que transformam vidas através do conhecimento e da fé.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="shadow-glow">
                <Link to={user ? "/catalogo" : "/cadastro"}>
                  {user ? "Ver Catálogo" : "Começar Agora"}
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/sobre">Conhecer o GEEC</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-none bg-gradient-to-br from-card to-muted/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="font-serif font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold">Destaques do Acervo</h2>
              <p className="text-muted-foreground mt-1">
                Obras essenciais da literatura espírita
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalogo">
                Ver Todos
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="overflow-hidden border-none shadow-2xl">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-serif font-bold mb-4">
                  Faça Parte da Nossa Comunidade
                </h2>
                <p className="text-muted-foreground mb-6">
                  Cadastre-se gratuitamente para emprestar livros, acompanhar seu histórico 
                  e receber novidades sobre nosso acervo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!user ? (
                    <>
                      <Button size="lg" asChild>
                        <Link to="/cadastro">Criar Conta Grátis</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link to="/login">Já tenho conta</Link>
                      </Button>
                    </>
                  ) : (
                    <Button size="lg" asChild>
                      <Link to="/catalogo">Explorar Catálogo</Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="hidden md:block relative bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full gradient-primary opacity-50 blur-3xl" />
                </div>
                <div className="relative h-full flex items-center justify-center p-8">
                  <BookOpen size={120} className="text-primary/30" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
