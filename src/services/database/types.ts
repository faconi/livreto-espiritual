// Abstract database types for portability
export interface DbBook {
  id: string;
  title: string;
  author: string;
  spirit_author?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  edition?: string | null;
  pages?: number | null;
  isbn?: string | null;
  barcode?: string | null;
  cover_url?: string | null;
  summary?: string | null;
  category?: string | null;
  tags?: string[] | null;
  available_for_loan: number;
  available_for_sale: number;
  sale_price?: number | null;
  discount?: number | null;
  is_featured?: boolean | null;
  is_new?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  social_name?: string | null;
  phone?: string | null;
  cpf?: string | null;
  address?: Record<string, unknown> | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface DbLoan {
  id: string;
  user_id: string;
  book_id: string;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'renewal_pending' | 'return_pending';
  loan_date?: string | null;
  due_date?: string | null;
  return_date?: string | null;
  renewals_count: number;
  user_notes?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSale {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_method?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbWishlist {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface DbCartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  type: 'loan' | 'purchase';
  created_at: string;
}

export interface DbActivity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string | null;
  item_id?: string | null;
  item_title?: string | null;
  metadata?: Record<string, unknown> | null;
  action_url?: string | null;
  created_at: string;
}

export interface DbSystemSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  updated_at: string;
}
