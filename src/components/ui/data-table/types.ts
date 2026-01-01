import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: string }[];
  className?: string;
  headerClassName?: string;
}

export interface ColumnFilter {
  id: string;
  value: string | string[];
}

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchableFields?: (keyof T)[];
  renderCard?: (item: T, index: number) => ReactNode;
  renderListItem?: (item: T, index: number) => ReactNode;
  onRowClick?: (item: T) => void;
  isAdmin?: boolean;
  onEdit?: (item: T) => void;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  importTemplateUrl?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  idField?: keyof T;
  defaultView?: 'table' | 'cards' | 'list';
  showViewToggle?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  className?: string;
}

export type ViewMode = 'table' | 'cards' | 'list';
