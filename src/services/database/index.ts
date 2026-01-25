// Re-export database adapter and types
// To switch to PHP/MySQL, replace the adapter import here
export { supabaseAdapter as db } from './supabaseAdapter';
export * from './types';
export * from './mappers';
