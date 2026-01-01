import { 
  Search, 
  LayoutGrid, 
  List, 
  Table as TableIcon, 
  Plus, 
  Download, 
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ViewMode, ColumnFilter } from './types';
import { Badge } from '@/components/ui/badge';

interface DataTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  showSearch?: boolean;
  isAdmin?: boolean;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  importTemplateUrl?: string;
  activeFilters: ColumnFilter[];
  onClearFilter: (columnId: string) => void;
  onClearAllFilters: () => void;
  totalItems: number;
  filteredItems: number;
}

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  viewMode,
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  isAdmin,
  onCreate,
  onExport,
  onImport,
  importTemplateUrl,
  activeFilters,
  onClearFilter,
  onClearAllFilters,
  totalItems,
  filteredItems,
}: DataTableToolbarProps) {
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* View toggle */}
        {showViewToggle && (
          <div className="flex items-center border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewModeChange('table')}
            >
              <TableIcon size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewModeChange('list')}
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewModeChange('cards')}
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {onCreate && (
              <Button onClick={onCreate} size="sm">
                <Plus size={16} className="mr-1" />
                Novo
              </Button>
            )}
            
            {(onExport || onImport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-1" />
                    Exportar/Importar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                  {onExport && (
                    <DropdownMenuItem onClick={onExport}>
                      <Download size={14} className="mr-2" />
                      Exportar CSV
                    </DropdownMenuItem>
                  )}
                  {onImport && (
                    <>
                      <DropdownMenuItem asChild>
                        <label className="cursor-pointer flex items-center">
                          <Upload size={14} className="mr-2" />
                          Importar CSV
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileImport}
                          />
                        </label>
                      </DropdownMenuItem>
                      {importTemplateUrl && (
                        <DropdownMenuItem asChild>
                          <a href={importTemplateUrl} download>
                            <Download size={14} className="mr-2" />
                            Baixar Template
                          </a>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Active filters and count */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {filteredItems === totalItems 
            ? `${totalItems} itens` 
            : `${filteredItems} de ${totalItems} itens`}
        </span>

        {activeFilters.length > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="flex flex-wrap items-center gap-1">
              {activeFilters.map(filter => (
                <Badge 
                  key={filter.id} 
                  variant="secondary" 
                  className="gap-1 pr-1"
                >
                  {filter.id}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => onClearFilter(filter.id)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onClearAllFilters}
              >
                Limpar todos
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
