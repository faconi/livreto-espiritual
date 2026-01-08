import { useState, useMemo, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { 
  DataTableProps, 
  ViewMode, 
  SortConfig, 
  ColumnFilter as ColumnFilterType 
} from './types';
import { DataTableHeader } from './DataTableHeader';
import { DataTableToolbar } from './DataTableToolbar';

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  searchableFields = [],
  renderCard,
  renderListItem,
  onRowClick,
  isAdmin = false,
  onEdit,
  onCreate,
  onExport,
  onImport,
  importTemplateUrl,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
  idField = 'id' as keyof T,
  defaultView = 'table',
  showViewToggle = true,
  showSearch = true,
  showFilters = true,
  className = '',
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    column: '', 
    direction: null 
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFilterType[]>([]);

  // Get cell value helper
  const getCellValue = useCallback((row: T, columnId: string): unknown => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return undefined;
    
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey];
    }
    return undefined;
  }, [columns]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery && searchableFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return searchableFields.some(field => {
          const value = item[field];
          return value !== undefined && 
                 value !== null && 
                 String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply column filters
    columnFilters.forEach(filter => {
      if (!filter.value || (Array.isArray(filter.value) && filter.value.length === 0)) {
        return;
      }
      
      result = result.filter(item => {
        const cellValue = getCellValue(item, filter.id);
        if (cellValue === undefined || cellValue === null) return false;
        
        const stringValue = String(cellValue);
        
        if (Array.isArray(filter.value)) {
          return filter.value.includes(stringValue);
        }
        
        return stringValue.toLowerCase().includes(filter.value.toLowerCase());
      });
    });

    return result;
  }, [data, searchQuery, searchableFields, columnFilters, getCellValue]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, sortConfig.column);
      const bValue = getCellValue(b, sortConfig.column);

      if (aValue === bValue) return 0;
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { 
        numeric: true 
      });

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, getCellValue]);

  const handleSort = (columnId: string) => {
    setSortConfig(prev => {
      if (prev.column !== columnId) {
        return { column: columnId, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column: columnId, direction: 'desc' };
      }
      return { column: '', direction: null };
    });
  };

  const handleFilterChange = (columnId: string, value: string | string[]) => {
    setColumnFilters(prev => {
      const existing = prev.findIndex(f => f.id === columnId);
      if (existing >= 0) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return prev.filter(f => f.id !== columnId);
        }
        return prev.map(f => f.id === columnId ? { ...f, value } : f);
      }
      if (value && (!Array.isArray(value) || value.length > 0)) {
        return [...prev, { id: columnId, value }];
      }
      return prev;
    });
  };

  const activeFilters = columnFilters.filter(
    f => f.value && (!Array.isArray(f.value) || f.value.length > 0)
  );

  const renderTableView = () => (
    <div className="border rounded-lg overflow-hidden overflow-x-auto">
      {/* Mobile: Show cards view instead of table */}
      <div className="block md:hidden">
        {sortedData.length > 0 ? (
          <div className="divide-y">
            {sortedData.map((row, index) => (
              <div
                key={String(row[idField]) || index}
                className={`p-4 ${onRowClick ? 'cursor-pointer active:bg-muted/50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                <div className="space-y-2">
                  {columns.slice(0, 4).map((column, colIndex) => {
                    const value = column.cell 
                      ? column.cell(row) 
                      : String(getCellValue(row, column.id) ?? '-');
                    return (
                      <div key={column.id} className={colIndex === 0 ? 'font-medium' : 'text-sm text-muted-foreground'}>
                        {colIndex === 0 ? (
                          value
                        ) : (
                          <span><span className="text-xs opacity-70">{column.header as string}: </span>{value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isAdmin && onEdit && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                    >
                      <Pencil size={14} className="mr-2" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {emptyIcon}
              <p>{emptyMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Standard table view */}
      <Table className="hidden md:table">
        <DataTableHeader
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          columnFilters={columnFilters}
          onFilterChange={handleFilterChange}
          data={data}
          isAdmin={isAdmin}
          onEdit={onEdit}
        />
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <TableRow
                key={String(row[idField]) || index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell 
                      ? column.cell(row) 
                      : String(getCellValue(row, column.id) ?? '-')}
                  </TableCell>
                ))}
                {isAdmin && onEdit && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (isAdmin && onEdit ? 1 : 0)} 
                className="h-32 text-center"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {emptyIcon}
                  <p>{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardsView = () => {
    // Fallback to mobile card rendering if no custom renderCard
    const renderDefaultCard = (row: T, index: number) => (
      <div 
        key={String(row[idField]) || index}
        className={`p-4 border rounded-lg bg-card ${onRowClick ? 'cursor-pointer active:bg-muted/50' : ''}`}
        onClick={() => onRowClick?.(row)}
      >
        <div className="space-y-2">
          {columns.slice(0, 4).map((column, colIndex) => {
            const value = column.cell 
              ? column.cell(row) 
              : String(getCellValue(row, column.id) ?? '-');
            return (
              <div key={column.id} className={colIndex === 0 ? 'font-medium' : 'text-sm text-muted-foreground'}>
                {colIndex === 0 ? (
                  value
                ) : (
                  <span><span className="text-xs opacity-70">{column.header as string}: </span>{value}</span>
                )}
              </div>
            );
          })}
        </div>
        {isAdmin && onEdit && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            >
              <Pencil size={14} className="mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedData.length > 0 ? (
          sortedData.map((item, index) => (
            <div 
              key={String(item[idField]) || index}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={renderCard ? (() => onRowClick?.(item)) : undefined}
            >
              {renderCard ? renderCard(item, index) : renderDefaultCard(item, index)}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {emptyIcon}
              <p>{emptyMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    // Fallback to detailed list rendering if no custom renderListItem
    const renderDefaultListItem = (row: T, index: number) => (
      <div 
        key={String(row[idField]) || index}
        className={`p-4 border rounded-lg bg-card ${onRowClick ? 'cursor-pointer active:bg-muted/50' : ''}`}
        onClick={() => onRowClick?.(row)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 space-y-1">
            {columns.map((column, colIndex) => {
              const value = column.cell 
                ? column.cell(row) 
                : String(getCellValue(row, column.id) ?? '-');
              return (
                <div key={column.id} className={colIndex === 0 ? 'font-medium text-base' : 'text-sm text-muted-foreground'}>
                  {colIndex === 0 ? (
                    value
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs opacity-70">{column.header as string}:</span> {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {isAdmin && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            >
              <Pencil size={14} className="mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>
    );

    return (
      <div className="space-y-3">
        {sortedData.length > 0 ? (
          sortedData.map((item, index) => (
            <div 
              key={String(item[idField]) || index}
              className={onRowClick && renderListItem ? 'cursor-pointer' : ''}
              onClick={renderListItem ? (() => onRowClick?.(item)) : undefined}
            >
              {renderListItem ? renderListItem(item, index) : renderDefaultListItem(item, index)}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {emptyIcon}
              <p>{emptyMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={showViewToggle}
        showSearch={showSearch}
        isAdmin={isAdmin}
        onCreate={onCreate}
        onExport={onExport}
        onImport={onImport}
        importTemplateUrl={importTemplateUrl}
        activeFilters={activeFilters}
        onClearFilter={(id) => handleFilterChange(id, '')}
        onClearAllFilters={() => setColumnFilters([])}
        totalItems={data.length}
        filteredItems={sortedData.length}
      />

      {viewMode === 'table' && renderTableView()}
      {viewMode === 'cards' && renderCardsView()}
      {viewMode === 'list' && renderListView()}
    </div>
  );
}
