import React from 'react';
import { AppProvider } from '../../reducerContexts/App';

export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>
    {children}
  </AppProvider>
);
