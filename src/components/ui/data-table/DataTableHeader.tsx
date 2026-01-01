import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, SortConfig, ColumnFilter as ColumnFilterType } from './types';
import { ColumnFilter } from './ColumnFilter';

interface DataTableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sortConfig: SortConfig;
  onSort: (columnId: string) => void;
  columnFilters: ColumnFilterType[];
  onFilterChange: (columnId: string, value: string | string[]) => void;
  data: T[];
  isAdmin?: boolean;
  onEdit?: (item: T) => void;
}

export function DataTableHeader<T>({
  columns,
  sortConfig,
  onSort,
  columnFilters,
  onFilterChange,
  data,
  isAdmin,
  onEdit,
}: DataTableHeaderProps<T>) {
  const getFilterValue = (columnId: string): string | string[] => {
    const filter = columnFilters.find(f => f.id === columnId);
    return filter?.value ?? '';
  };

  const getUniqueValues = (column: ColumnDef<T>): string[] => {
    if (column.filterOptions) return [];
    
    const values = new Set<string>();
    data.forEach(row => {
      let val: unknown;
      if (column.accessorFn) {
        val = column.accessorFn(row);
      } else if (column.accessorKey) {
        val = row[column.accessorKey];
      }
      if (val !== undefined && val !== null && val !== '') {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  };

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {columns.map((column) => (
          <TableHead 
            key={column.id} 
            className={column.headerClassName}
          >
            <div className="flex items-center gap-1">
              {column.sortable ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 -ml-2 font-medium hover:bg-muted/50"
                  onClick={() => onSort(column.id)}
                >
                  {column.header}
                  {sortConfig.column === column.id ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    )
                  ) : (
                    <ArrowUpDown size={14} className="ml-1 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <span className="font-medium">{column.header}</span>
              )}

              {column.filterable && (
                <ColumnFilter
                  column={column}
                  value={getFilterValue(column.id)}
                  onChange={(value) => onFilterChange(column.id, value)}
                  allValues={column.filterType === 'select' ? getUniqueValues(column) : undefined}
                />
              )}
            </div>
          </TableHead>
        ))}
        {isAdmin && onEdit && (
          <TableHead className="w-24 text-right">Ações</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
