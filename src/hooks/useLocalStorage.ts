import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get stored value or use initial
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sync with localStorage on mount and when key changes
  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  return [storedValue, setValue];
}

// Helper to serialize/deserialize dates in objects
export function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDates(value);
    }
    return result as T;
  }
  
  return obj;
}

export function deserializeDates<T>(obj: T, dateFields: string[]): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeDates(item, dateFields)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = { ...(obj as object) };
    for (const [key, value] of Object.entries(result)) {
      if (dateFields.includes(key) && typeof value === 'string') {
        result[key] = new Date(value);
      } else if (typeof value === 'object') {
        result[key] = deserializeDates(value, dateFields);
      }
    }
    return result as T;
  }
  
  return obj;
}
