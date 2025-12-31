import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Grupo Espírita Evangelho de Cristo - Biblioteca e Livraria. 
              Difundindo conhecimento espírita há mais de 45 anos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold mb-4">Links Rápidos</h3>
            <nav className="space-y-2">
              <Link 
                to="/catalogo" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Catálogo de Livros
              </Link>
              <Link 
                to="/sobre" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sobre Nós
              </Link>
              <a 
                href="https://evangelhodecristoop.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Site do GEEC
                <ExternalLink size={12} />
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-0.5 text-primary" />
                <span>Ouro Preto - MG</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <span>contato@geec.com.br</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Grupo Espírita Evangelho de Cristo. 
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
