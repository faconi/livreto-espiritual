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
      <div className="flex flex-col gap-3">
        {/* Search - always full width on mobile */}
        {showSearch && (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        )}

        {/* Controls row - wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          {showViewToggle && (
            <div className="flex items-center border rounded-lg p-1 bg-muted/30">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                onClick={() => onViewModeChange('table')}
              >
                <TableIcon size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                onClick={() => onViewModeChange('list')}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                onClick={() => onViewModeChange('cards')}
              >
                <LayoutGrid size={16} />
              </Button>
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 ml-auto">
              {onCreate && (
                <Button onClick={onCreate} size="sm" className="h-9">
                  <Plus size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              )}
              
              {(onExport || onImport) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Download size={16} className="sm:mr-1" />
                      <span className="hidden sm:inline">Exportar/Importar</span>
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
      </div>

      {/* Active filters and count */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground whitespace-nowrap">
          {filteredItems === totalItems 
            ? `${totalItems} itens` 
            : `${filteredItems} de ${totalItems}`}
        </span>

        {activeFilters.length > 0 && (
          <>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
              {activeFilters.map(filter => (
                <Badge 
                  key={filter.id} 
                  variant="secondary" 
                  className="gap-1 pr-1 text-xs"
                >
                  <span className="max-w-[100px] truncate">
                    {filter.id}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                  </span>
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
                Limpar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
