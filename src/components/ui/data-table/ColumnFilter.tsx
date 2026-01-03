import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnFilterProps<T> {
  column: ColumnDef<T>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  allValues?: string[];
}

export function ColumnFilter<T>({ 
  column, 
  value, 
  onChange,
  allValues = []
}: ColumnFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState('');

  const hasFilter = Array.isArray(value) ? value.length > 0 : !!value;

  const handleApply = () => {
    onChange(localValue);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalValue(column.filterType === 'select' ? [] : '');
    onChange(column.filterType === 'select' ? [] : '');
    setSearchTerm('');
    setOpen(false);
  };

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Get filter options
  const filterOptions = column.filterOptions || allValues.map(v => ({ label: v, value: v }));
  
  // Filter options based on search term
  const filteredOptions = filterOptions.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-6 w-6 p-0 ml-1 ${hasFilter ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Filter size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3 bg-popover border border-border shadow-lg z-50" 
        align="start"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filtrar {column.header}</span>
            {hasFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={handleClear}
              >
                <X size={12} className="mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Text input for filtering */}
          {column.filterType === 'text' ? (
            <Input
              placeholder={`Filtrar por ${column.header.toLowerCase()}...`}
              value={localValue as string}
              onChange={(e) => setLocalValue(e.target.value)}
              className="h-8 text-sm"
            />
          ) : (
            <>
              {/* Search input for select options */}
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar opções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-sm pl-7"
                />
              </div>

              {/* Options list */}
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <label 
                        key={option.value} 
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded text-sm"
                      >
                        <Checkbox
                          checked={(localValue as string[])?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = (localValue as string[]) || [];
                            if (checked) {
                              setLocalValue([...currentValues, option.value]);
                            } else {
                              setLocalValue(currentValues.filter(v => v !== option.value));
                            }
                          }}
                        />
                        <span className="truncate">{option.label}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhuma opção encontrada
                    </p>
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
