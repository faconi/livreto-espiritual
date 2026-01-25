import { supabase } from '@/integrations/supabase/client';
import { DbBook, DbProfile, DbUserRole, DbLoan, DbSale, DbReview, DbWishlist, DbCartItem, DbActivity, DbSystemSetting } from './types';

// Generic Supabase adapter for database operations
// This can be replaced with a PHP/MySQL adapter in the future

export const supabaseAdapter = {
  // ========== BOOKS ==========
  async getBooks(): Promise<DbBook[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    if (error) throw error;
    return (data || []) as unknown as DbBook[];
  },

  async getBookById(id: string): Promise<DbBook | null> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as DbBook | null;
  },

  async createBook(book: Partial<DbBook>): Promise<DbBook> {
    const { data, error } = await supabase
      .from('books')
      .insert(book as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbBook;
  },

  async updateBook(id: string, updates: Partial<DbBook>): Promise<DbBook> {
    const { data, error } = await supabase
      .from('books')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbBook;
  },

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  // ========== PROFILES ==========
  async getProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as DbProfile | null;
  },

  async getProfiles(): Promise<DbProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return (data || []) as unknown as DbProfile[];
  },

  async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<DbProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbProfile;
  },

  // ========== USER ROLES ==========
  async getUserRoles(userId: string): Promise<DbUserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []) as unknown as DbUserRole[];
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    if (error) return false;
    return !!data;
  },

  async addUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role } as any);
    if (error && !error.message.includes('duplicate')) throw error;
  },

  async removeUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    if (error) throw error;
  },

  // ========== LOANS ==========
  async getLoans(userId?: string): Promise<(DbLoan & { books: DbBook; profiles: DbProfile })[]> {
    let query = supabase
      .from('loans')
      .select('*, books(*), profiles(*)');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as (DbLoan & { books: DbBook; profiles: DbProfile })[];
  },

  async createLoan(loan: Partial<DbLoan>): Promise<DbLoan> {
    const { data, error } = await supabase
      .from('loans')
      .insert(loan as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbLoan;
  },

  async updateLoan(id: string, updates: Partial<DbLoan>): Promise<DbLoan> {
    const { data, error } = await supabase
      .from('loans')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbLoan;
  },

  async getActiveLoansCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'active', 'renewal_pending', 'return_pending']);
    if (error) throw error;
    return count || 0;
  },

  // ========== SALES ==========
  async getSales(userId?: string): Promise<(DbSale & { books: DbBook; profiles: DbProfile })[]> {
    let query = supabase
      .from('sales')
      .select('*, books(*), profiles(*)');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as (DbSale & { books: DbBook; profiles: DbProfile })[];
  },

  async createSale(sale: Partial<DbSale>): Promise<DbSale> {
    const { data, error } = await supabase
      .from('sales')
      .insert(sale as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbSale;
  },

  async updateSale(id: string, updates: Partial<DbSale>): Promise<DbSale> {
    const { data, error } = await supabase
      .from('sales')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbSale;
  },

  // ========== REVIEWS ==========
  async getReviews(bookId?: string): Promise<(DbReview & { profiles: DbProfile })[]> {
    let query = supabase
      .from('reviews')
      .select('*, profiles(*)');
    
    if (bookId) {
      query = query.eq('book_id', bookId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as (DbReview & { profiles: DbProfile })[];
  },

  async createReview(review: Partial<DbReview>): Promise<DbReview> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbReview;
  },

  async updateReview(id: string, updates: Partial<DbReview>): Promise<DbReview> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbReview;
  },

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  },

  // ========== WISHLISTS ==========
  async getWishlist(userId: string): Promise<(DbWishlist & { books: DbBook })[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, books(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []) as unknown as (DbWishlist & { books: DbBook })[];
  },

  async addToWishlist(userId: string, bookId: string): Promise<DbWishlist> {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, book_id: bookId } as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbWishlist;
  },

  async removeFromWishlist(userId: string, bookId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);
    if (error) throw error;
  },

  async isInWishlist(userId: string, bookId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  },

  // ========== CART ==========
  async getCart(userId: string): Promise<(DbCartItem & { books: DbBook })[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, books(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []) as unknown as (DbCartItem & { books: DbBook })[];
  },

  async addToCart(item: Partial<DbCartItem>): Promise<DbCartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(item as any, { onConflict: 'user_id,book_id,type' })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbCartItem;
  },

  async updateCartItem(id: string, updates: Partial<DbCartItem>): Promise<DbCartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbCartItem;
  },

  async removeFromCart(id: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (error) throw error;
  },

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error;
  },

  // ========== ACTIVITIES ==========
  async getActivities(userId: string): Promise<DbActivity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as DbActivity[];
  },

  async createActivity(activity: Partial<DbActivity>): Promise<DbActivity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbActivity;
  },

  // ========== SYSTEM SETTINGS ==========
  async getSettings(): Promise<DbSystemSetting[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');
    if (error) throw error;
    return (data || []) as unknown as DbSystemSetting[];
  },

  async getSetting(key: string): Promise<DbSystemSetting | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as DbSystemSetting | null;
  },

  async updateSetting(key: string, value: Record<string, unknown>): Promise<DbSystemSetting> {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ value } as any)
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DbSystemSetting;
  },
};
