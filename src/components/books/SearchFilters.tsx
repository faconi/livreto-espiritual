import { useState } from 'react';
import { Search, SlidersHorizontal, X, Camera, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SearchFilters as FilterType } from '@/types';
import { categories, publishers } from '@/data/mockBooks';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  className?: string;
}

export function SearchFilters({ filters, onFiltersChange, className }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const handlePhotoSearch = () => {
    // TODO: Implement photo search with AI
    alert('Busca por foto será implementada com integração de IA');
  };

  const handleBarcodeSearch = () => {
    // TODO: Implement barcode scanner
    alert('Leitor de código de barras será implementado');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor, espírito, editora..."
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Photo search */}
        <Button variant="outline" size="icon" onClick={handlePhotoSearch}>
          <Camera size={18} />
        </Button>
        
        {/* Barcode scanner */}
        <Button variant="outline" size="icon" onClick={handleBarcodeSearch}>
          <Barcode size={18} />
        </Button>
        
        {/* Filters sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal size={18} className="mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros de Busca</SheetTitle>
              <SheetDescription>
                Refine sua busca usando os filtros abaixo
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Author filter */}
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input
                  placeholder="Nome do autor"
                  value={filters.author || ''}
                  onChange={(e) => updateFilter('author', e.target.value)}
                />
              </div>

              {/* Spirit author filter */}
              <div className="space-y-2">
                <Label>Espírito Autor</Label>
                <Input
                  placeholder="Nome do espírito"
                  value={filters.spiritAuthor || ''}
                  onChange={(e) => updateFilter('spiritAuthor', e.target.value)}
                />
              </div>

              {/* Publisher filter */}
              <div className="space-y-2">
                <Label>Editora</Label>
                <Select
                  value={filters.publisher || ''}
                  onValueChange={(value) => updateFilter('publisher', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma editora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {publishers.map(pub => (
                      <SelectItem key={pub} value={pub}>{pub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability filters */}
              <div className="space-y-4">
                <Label>Disponibilidade</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="forLoan" className="font-normal">
                    Disponível para empréstimo
                  </Label>
                  <Switch
                    id="forLoan"
                    checked={filters.availableForLoan || false}
                    onCheckedChange={(checked) => updateFilter('availableForLoan', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="forSale" className="font-normal">
                    Disponível para venda
                  </Label>
                  <Switch
                    id="forSale"
                    checked={filters.availableForSale || false}
                    onCheckedChange={(checked) => updateFilter('availableForSale', checked)}
                  />
                </div>
              </div>

              {/* Clear filters */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearFilters}
              >
                <X size={16} className="mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.query}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => updateFilter('query', '')}
              />
            </Badge>
          )}
          {filters.author && (
            <Badge variant="secondary" className="gap-1">
              Autor: {filters.author}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => updateFilter('author', '')}
              />
            </Badge>
          )}
          {filters.spiritAuthor && (
            <Badge variant="secondary" className="gap-1">
              Espírito: {filters.spiritAuthor}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => updateFilter('spiritAuthor', '')}
              />
            </Badge>
          )}
          {filters.publisher && (
            <Badge variant="secondary" className="gap-1">
              Editora: {filters.publisher}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => updateFilter('publisher', '')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Categoria: {filters.category}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => updateFilter('category', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
