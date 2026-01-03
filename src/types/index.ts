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
  paymentStatus: 'pending' | 'completed' | 'failed';
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

// Pending confirmation types for admin
export type PendingConfirmationType = 
  | 'loan_return'
  | 'loan_renewal'
  | 'payment'
  | 'loan_request';

export interface PendingConfirmation {
  id: string;
  type: PendingConfirmationType;
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string; // bookId, loanId, or saleId
  itemTitle: string;
  requestedAt: Date;
  justification?: string;
  adminNotes?: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: Date;
  resolvedBy?: string;
  rejectionReason?: string;
}

// Activity timeline types
export type ActivityType = 
  | 'loan_request'
  | 'loan_confirmed'
  | 'loan_return_requested'
  | 'loan_returned'
  | 'loan_renewal_requested'
  | 'loan_renewed'
  | 'purchase'
  | 'payment_pending'
  | 'payment_completed'
  | 'payment_failed'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'message_sent'
  | 'message_received';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  itemId?: string;
  itemTitle?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  isAlert?: boolean;
  actionUrl?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  addedAt: Date;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  subject: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
  relatedItemId?: string;
  relatedItemType?: 'loan' | 'sale' | 'book';
}
