import { Book, User, Loan, Activity } from '@/types';
import { DbBook, DbProfile, DbLoan, DbActivity, DbUserRole } from './types';

// Map database book to app Book type
export function mapDbBookToBook(db: DbBook): Book {
  return {
    id: db.id,
    isbn: db.isbn || undefined,
    title: db.title,
    author: db.author,
    spiritAuthor: db.spirit_author || undefined,
    publisher: db.publisher || '',
    coverUrl: db.cover_url || undefined,
    description: db.summary || undefined,
    category: db.category || undefined,
    edition: db.edition || undefined,
    year: db.publication_year || undefined,
    pages: db.pages || undefined,
    tags: db.tags || undefined,
    quantityForLoan: db.available_for_loan,
    quantityForSale: db.available_for_sale,
    availableForLoan: db.available_for_loan,
    availableForSale: db.available_for_sale,
    salePrice: db.sale_price || undefined,
    discount: db.discount || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// Map app Book type to database format
export function mapBookToDbBook(book: Partial<Book>): Partial<DbBook> {
  return {
    title: book.title,
    author: book.author,
    spirit_author: book.spiritAuthor || null,
    publisher: book.publisher || null,
    publication_year: book.year || null,
    edition: book.edition || null,
    pages: book.pages || null,
    isbn: book.isbn || null,
    cover_url: book.coverUrl || null,
    summary: book.description || null,
    category: book.category || null,
    tags: book.tags || null,
    available_for_loan: book.availableForLoan ?? 0,
    available_for_sale: book.availableForSale ?? 0,
    sale_price: book.salePrice || null,
    discount: book.discount || null,
  };
}

// Map database profile + roles to app User type
export function mapDbProfileToUser(profile: DbProfile, roles: DbUserRole[]): User {
  const isAdmin = roles.some(r => r.role === 'admin');
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    socialName: profile.social_name || undefined,
    phone: profile.phone || undefined,
    cpf: profile.cpf || undefined,
    address: profile.address ? JSON.stringify(profile.address) : undefined,
    avatarUrl: profile.avatar_url || undefined,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date(profile.created_at),
  };
}

// Map database loan to app Loan type
export function mapDbLoanToLoan(db: DbLoan & { books?: DbBook; profiles?: DbProfile }): Loan {
  const statusMap: Record<string, Loan['status']> = {
    pending: 'pending_return',
    active: 'active',
    returned: 'returned',
    overdue: 'overdue',
    renewal_pending: 'pending_renewal',
    return_pending: 'pending_return',
  };

  return {
    id: db.id,
    bookId: db.book_id,
    userId: db.user_id,
    status: statusMap[db.status] || 'active',
    borrowedAt: db.loan_date ? new Date(db.loan_date) : new Date(db.created_at),
    dueDate: db.due_date ? new Date(db.due_date) : new Date(),
    returnedAt: db.return_date ? new Date(db.return_date) : undefined,
    renewalCount: db.renewals_count,
    adminNotes: db.admin_notes || undefined,
    book: db.books ? mapDbBookToBook(db.books) : undefined,
  };
}

// Map database activity to app Activity type
export function mapDbActivityToActivity(db: DbActivity): Activity {
  return {
    id: db.id,
    userId: db.user_id,
    type: db.type as Activity['type'],
    title: db.title,
    description: db.description || '',
    itemId: db.item_id || undefined,
    itemTitle: db.item_title || undefined,
    createdAt: new Date(db.created_at),
    metadata: db.metadata as Record<string, unknown> | undefined,
    actionUrl: db.action_url || undefined,
  };
}
