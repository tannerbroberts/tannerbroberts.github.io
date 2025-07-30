import React from 'react';
import { StorageAwareAppProvider } from '../../localStorageImplementation/StorageAwareAppProvider';

export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <StorageAwareAppProvider>
    {children}
  </StorageAwareAppProvider>
);
