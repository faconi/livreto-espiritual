import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from './types';

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

  const hasFilter = Array.isArray(value) ? value.length > 0 : !!value;

  const handleApply = () => {
    onChange(localValue);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalValue(column.filterType === 'select' ? [] : '');
    onChange(column.filterType === 'select' ? [] : '');
    setOpen(false);
  };

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

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
        className="w-64 p-3 bg-popover border border-border shadow-lg z-50" 
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

          {column.filterType === 'select' && column.filterOptions ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {column.filterOptions.map((option) => (
                <label 
                  key={option.value} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
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
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          ) : column.filterType === 'select' && allValues.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allValues.map((val) => (
                <label 
                  key={val} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                >
                  <Checkbox
                    checked={(localValue as string[])?.includes(val)}
                    onCheckedChange={(checked) => {
                      const currentValues = (localValue as string[]) || [];
                      if (checked) {
                        setLocalValue([...currentValues, val]);
                      } else {
                        setLocalValue(currentValues.filter(v => v !== val));
                      }
                    }}
                  />
                  <span className="text-sm">{val}</span>
                </label>
              ))}
            </div>
          ) : (
            <Input
              placeholder={`Filtrar por ${column.header.toLowerCase()}...`}
              value={localValue as string}
              onChange={(e) => setLocalValue(e.target.value)}
              className="h-8 text-sm"
            />
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
