export interface User {
  id: string;
  email: string;
  fullName: string;
  socialName?: string;
  phone?: string;
  cpf?: string;
  address?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  notes?: string; // admin only
}

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  spiritAuthor?: string;
  publisher: string;
  coverUrl?: string;
  description?: string;
  category?: string;
  year?: number;
  pages?: number;
  
  // Inventory
  quantityForLoan: number;
  quantityForSale: number;
  availableForLoan: number;
  availableForSale: number;
  
  // Pricing
  acquisitionPrice?: number;
  salePrice?: number;
  suggestedMargin?: number;
  discount?: number;
  isDonation?: boolean;
  
  // Admin metadata
  invoiceNumber?: string;
  acquisitionDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  book?: Book;
  user?: User;
  status: 'active' | 'pending_return' | 'pending_renewal' | 'returned' | 'overdue';
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  renewalCount?: number;
  returnJustification?: string;
  renewalJustification?: string;
  adminNotes?: string;
}

export interface Sale {
  id: string;
  bookId: string;
  userId: string;
  book?: Book;
  user?: User;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'cash' | 'pix';
  paymentStatus: 'pending' | 'completed';
  createdAt: Date;
}

export interface CartItem {
  book: Book;
  quantity: number;
  type: 'loan' | 'purchase';
}

export interface SearchFilters {
  query?: string;
  author?: string;
  spiritAuthor?: string;
  publisher?: string;
  category?: string;
  availableForLoan?: boolean;
  availableForSale?: boolean;
}
