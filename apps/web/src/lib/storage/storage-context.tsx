'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { StorageService } from '@/types/storage';
import { localStorageService } from './local-storage';

interface StorageContextType {
  storage: StorageService;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
  storageService?: StorageService;
}

export function StorageProvider({ 
  children, 
  storageService = localStorageService 
}: StorageProviderProps) {
  const value: StorageContextType = {
    storage: storageService,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context.storage;
}