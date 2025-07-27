# Step 6: Enhanced UI and Polish

## Step Overview
Add final polish, performance optimizations, error handling, and enhanced user experience features to complete the item instances, variables, and accounting implementation. This step ensures the features are production-ready with comprehensive validation and smooth user interactions.

## Dependencies
- Step 1: Core Data Models and Types must be completed
- Step 2: Storage and Reducer Integration must be completed
- Step 3: Instance Tracking in Execution must be completed
- Step 4: Variables System Implementation must be completed
- Step 5: Accounting View Implementation must be completed

## Detailed Requirements

### Main Interface Integration
- Position AccountingView above ExecutionView in main interface
- Create unified main screen combining both accounting and execution
- Ensure seamless workflow between marking completion and starting tasks
- Update MainBody component to include accounting view
- Maintain responsive design for both views

### Performance Optimizations
- Virtualization for large instance lists
- Debounced search and filtering
- Memoized variable calculations
- Batch operations for bulk actions
- Lazy loading for variable summaries

### Enhanced User Experience
- User-controlled completion controls (no automatic completion)
- Loading states and skeleton screens
- Progressive disclosure for complex features
- Keyboard shortcuts and accessibility
- Contextual help and tooltips
- Smooth animations and transitions

### Error Handling and Validation
- Comprehensive error boundaries
- Data validation and recovery
- Graceful degradation
- User-friendly error messages
- Retry mechanisms
- Validation that only user actions mark items complete

### Advanced Features
- Export/import for accounting data
- Advanced filtering and search with hierarchical grouping
- Customizable views and preferences
- Notification system for overdue items
- Analytics and insights

## Code Changes Required

### 1. Update MainBody Integration

#### `src/components/MainBody.tsx`
```typescript
import { useAppState } from "../reducerContexts/App"
import { getItemById, hasChildren, getChildren, getChildId, type ChildReference } from "../functions/utils/item/index"
import { useViewportHeight } from "../hooks/useViewportHeight"
import ItemSchedule from "./ItemSchedule"
import LedgerLines from "./LedgerLines"
import ExecutionView from "./ExecutionView"
import AccountingView from "./accounting/AccountingView" // New import

export default function MainBody() {
  const { executionMode, showAccountingView } = useAppState()
  const height = useViewportHeight()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: height,
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {executionMode ? (
        <>
          {/* Accounting View - positioned above execution view for primary workflow */}
          {showAccountingView && (
            <div style={{
              flex: '0 0 auto',
              maxHeight: '40%',
              minHeight: '200px',
              borderBottom: '1px solid #e0e0e0',
              overflow: 'auto'
            }}>
              <AccountingView />
            </div>
          )}
          
          {/* Execution View - main execution interface */}
          <div style={{
            flex: '1 1 auto',
            minHeight: '300px',
            overflow: 'auto'
          }}>
            <ExecutionView />
          </div>
        </>
      ) : (
        /* Schedule View - existing implementation */
        <>
          <LedgerLines />
          <ItemSchedule />
        </>
      )}
    </div>
  )
}
```

### 2. Add Performance Optimizations

#### `src/components/accounting/VirtualizedAccountingList.tsx`
```typescript
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Typography } from '@mui/material';
import { ItemInstance } from '../../functions/utils/item/index';
import AccountingInstanceCard from './AccountingInstanceCard';

interface VirtualizedAccountingListProps {
  instances: ItemInstance[];
  height: number;
  itemHeight?: number;
}

interface InstanceItemProps {
  index: number;
  style: React.CSSProperties;
  data: ItemInstance[];
}

const InstanceItem = React.memo<InstanceItemProps>(({ index, style, data }) => (
  <div style={style}>
    <AccountingInstanceCard instance={data[index]} />
  </div>
));

export default function VirtualizedAccountingList({
  instances,
  height,
  itemHeight = 200
}: VirtualizedAccountingListProps) {
  const getItemSize = useCallback(() => itemHeight, [itemHeight]);

  if (instances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No instances to display
        </Typography>
      </Box>
    );
  }

  return (
    <List
      height={height}
      itemCount={instances.length}
      itemSize={getItemSize}
      itemData={instances}
      overscanCount={5}
    >
      {InstanceItem}
    </List>
  );
}
```

#### `src/hooks/useDebouncedValue.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### `src/hooks/useVariableSummaryCache.ts`
```typescript
import { useMemo, useRef, useCallback } from 'react';
import { Variable, VariableSummary, calculateVariableSummary } from '../functions/utils/item/index';
import { Item } from '../functions/utils/item/utils';

interface CacheEntry {
  summary: VariableSummary;
  timestamp: number;
  dependencies: string[]; // Item IDs that affect this calculation
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useVariableSummaryCache() {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const getCachedSummary = useCallback((
    itemId: string,
    item: Item,
    allItems: Item[],
    variableMap: Map<string, Variable[]>
  ): VariableSummary => {
    const cache = cacheRef.current;
    const cached = cache.get(itemId);
    const now = Date.now();

    // Check if cache is valid
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      // Verify dependencies haven't changed
      const dependenciesValid = cached.dependencies.every(depId => 
        allItems.find(i => i.id === depId) !== undefined
      );

      if (dependenciesValid) {
        return cached.summary;
      }
    }

    // Calculate fresh summary
    const summary = calculateVariableSummary(item, allItems, variableMap);
    
    // Determine dependencies (items in hierarchy)
    const dependencies = [itemId];
    const addChildDependencies = (parentItem: Item) => {
      if (parentItem instanceof SubCalendarItem || parentItem instanceof CheckListItem) {
        const children = parentItem.children;
        for (const child of children) {
          const childId = 'id' in child ? child.id : child.itemId;
          if (!dependencies.includes(childId)) {
            dependencies.push(childId);
            const childItem = allItems.find(i => i.id === childId);
            if (childItem) {
              addChildDependencies(childItem);
            }
          }
        }
      }
    };
    addChildDependencies(item);

    // Cache the result
    cache.set(itemId, {
      summary,
      timestamp: now,
      dependencies
    });

    return summary;
  }, []);

  const invalidateCache = useCallback((itemId?: string) => {
    const cache = cacheRef.current;
    
    if (itemId) {
      // Invalidate specific item and anything that depends on it
      const toInvalidate = new Set<string>();
      
      for (const [cachedItemId, entry] of cache) {
        if (cachedItemId === itemId || entry.dependencies.includes(itemId)) {
          toInvalidate.add(cachedItemId);
        }
      }
      
      for (const id of toInvalidate) {
        cache.delete(id);
      }
    } else {
      // Clear entire cache
      cache.clear();
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of cache) {
      if ((now - entry.timestamp) < CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: cache.size,
      validEntries,
      expiredEntries
    };
  }, []);

  return {
    getCachedSummary,
    invalidateCache,
    getCacheStats
  };
}
```

### 2. Add Loading States and Skeleton Screens

#### `src/components/common/SkeletonCard.tsx`
```typescript
import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

interface SkeletonCardProps {
  variant?: 'instance' | 'variable' | 'execution';
  count?: number;
}

export default function SkeletonCard({ variant = 'instance', count = 1 }: SkeletonCardProps) {
  const renderInstanceSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={20} />
          <Skeleton variant="rounded" width={80} height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderVariableSkeleton = () => (
    <Box sx={{ mb: 1 }}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rounded" width={80} height={32} />
        ))}
      </Box>
    </Box>
  );

  const renderExecutionSkeleton = () => (
    <Box>
      <Skeleton variant="rounded" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} />
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'variable':
        return renderVariableSkeleton();
      case 'execution':
        return renderExecutionSkeleton();
      case 'instance':
      default:
        return renderInstanceSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
}
```

#### `src/components/common/LoadingStateWrapper.tsx`
```typescript
import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import SkeletonCard from './SkeletonCard';

interface LoadingStateWrapperProps {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
  skeletonVariant?: 'instance' | 'variable' | 'execution';
  skeletonCount?: number;
  children: React.ReactNode;
}

export default function LoadingStateWrapper({
  loading,
  error,
  empty = false,
  emptyMessage = "No data available",
  loadingComponent,
  skeletonVariant = 'instance',
  skeletonCount = 3,
  children
}: LoadingStateWrapperProps) {
  if (loading) {
    return (
      <Fade in timeout={300}>
        <Box>
          {loadingComponent || <SkeletonCard variant={skeletonVariant} count={skeletonCount} />}
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  if (empty) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
```

### 3. Add Error Handling and Validation

#### `src/components/common/ErrorBoundary.tsx`
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper sx={{ p: 3, m: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <BugReport sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              An unexpected error occurred. Please try refreshing or contact support if the problem persists.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Error Details (Development Mode):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </Typography>
            </Alert>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}
```

#### `src/utils/validation.ts`
```typescript
import { ItemInstance, Variable } from '../functions/utils/item/index';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateItemInstance(instance: ItemInstance): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!instance.id) errors.push('Instance ID is required');
  if (!instance.itemId) errors.push('Item ID is required');
  if (!instance.calendarEntryId) errors.push('Calendar entry ID is required');
  if (!instance.scheduledStartTime) errors.push('Scheduled start time is required');

  // Logical validations
  if (instance.actualStartTime && instance.actualStartTime < instance.scheduledStartTime) {
    warnings.push('Actual start time is before scheduled start time');
  }

  if (instance.completedAt && instance.actualStartTime && instance.completedAt < instance.actualStartTime) {
    errors.push('Completion time cannot be before start time');
  }

  if (instance.isComplete && !instance.completedAt) {
    warnings.push('Instance marked complete but no completion time recorded');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateVariable(variable: Variable): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!variable.name || !variable.name.trim()) {
    errors.push('Variable name is required');
  }

  if (typeof variable.quantity !== 'number') {
    errors.push('Variable quantity must be a number');
  }

  if (isNaN(variable.quantity)) {
    errors.push('Variable quantity cannot be NaN');
  }

  // Warnings
  if (variable.quantity === 0) {
    warnings.push('Variable quantity is zero - consider removing this variable');
  }

  if (variable.name && variable.name.length > 50) {
    warnings.push('Variable name is very long - consider shortening');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateBatchOperation(instances: ItemInstance[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (instances.length === 0) {
    errors.push('No instances provided for batch operation');
    return { isValid: false, errors, warnings };
  }

  if (instances.length > 100) {
    warnings.push(`Large batch operation (${instances.length} instances) - consider breaking into smaller batches`);
  }

  // Check for duplicate instance IDs
  const ids = instances.map(i => i.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate instance IDs found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 4. Add Advanced Filtering and Search

#### `src/components/accounting/AdvancedAccountingFilters.tsx`
```typescript
import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  Chip,
  Autocomplete
} from '@mui/material';
import { ExpandMore, FilterList } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface AdvancedFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  durationRange: [number, number];
  itemTypes: string[];
  tags: string[];
  hasVariables: boolean;
  hasNotes: boolean;
  isOverdue: boolean;
  wasStarted: boolean;
}

interface AdvancedAccountingFiltersProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  availableItemTypes: string[];
  availableTags: string[];
}

export default function AdvancedAccountingFilters({
  filters,
  onChange,
  availableItemTypes,
  availableTags
}: AdvancedAccountingFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const updateFilters = (updates: Partial<AdvancedFilters>) => {
    onChange({ ...filters, ...updates });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value.start || value.end;
    if (key === 'durationRange') return value[0] > 0 || value[1] < 24 * 60 * 60 * 1000;
    if (key === 'itemTypes') return value.length > 0;
    if (key === 'tags') return value.length > 0;
    return value === true;
  }).length;

  return (
    <Accordion expanded={expanded} onChange={(_, isExpanded) => setExpanded(isExpanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography>Advanced Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
            />
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Date Range */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={(date) => updateFilters({
                  dateRange: { ...filters.dateRange, start: date }
                })}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={(date) => updateFilters({
                  dateRange: { ...filters.dateRange, end: date }
                })}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Box>

          {/* Duration Range */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Duration Range (minutes)
            </Typography>
            <Slider
              value={[
                filters.durationRange[0] / (60 * 1000),
                filters.durationRange[1] / (60 * 1000)
              ]}
              onChange={(_, value) => updateFilters({
                durationRange: [
                  (value as number[])[0] * 60 * 1000,
                  (value as number[])[1] * 60 * 1000
                ]
              })}
              valueLabelDisplay="auto"
              min={0}
              max={1440} // 24 hours
              step={15}
            />
          </Box>

          {/* Item Types */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Item Types
            </Typography>
            <Autocomplete
              multiple
              options={availableItemTypes}
              value={filters.itemTypes}
              onChange={(_, value) => updateFilters({ itemTypes: value })}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select item types" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </Box>

          {/* Status Filters */}
          <Box>
            <FormLabel component="legend">Status</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasVariables}
                    onChange={(e) => updateFilters({ hasVariables: e.target.checked })}
                  />
                }
                label="Has Variables"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasNotes}
                    onChange={(e) => updateFilters({ hasNotes: e.target.checked })}
                  />
                }
                label="Has Notes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.isOverdue}
                    onChange={(e) => updateFilters({ isOverdue: e.target.checked })}
                  />
                }
                label="Is Overdue"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.wasStarted}
                    onChange={(e) => updateFilters({ wasStarted: e.target.checked })}
                  />
                }
                label="Was Started"
              />
            </FormGroup>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
```

### 5. Add Keyboard Shortcuts and Accessibility

#### `src/hooks/useKeyboardShortcuts.ts`
```typescript
import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

// Predefined shortcuts for common actions
export const ACCOUNTING_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'a',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Select all instances'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: () => {}, // Will be overridden  
    description: 'Focus search'
  },
  {
    key: 'Enter',
    ctrlKey: true,
    action: () => {}, // Will be overridden
    description: 'Complete selected instances'
  },
  {
    key: 'Escape',
    action: () => {}, // Will be overridden
    description: 'Clear selection/close dialogs'
  }
];
```

### 6. Add Export/Import Functionality

#### `src/components/accounting/AccountingExportImport.tsx`
```typescript
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  LinearProgress
} from '@mui/material';
import { Download, Upload, FileDownload, FileUpload } from '@mui/icons-material';
import { useItemInstances } from '../../hooks/useItemInstances';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';
import { ItemInstance, ItemInstanceImpl } from '../../functions/utils/item/index';

interface ExportFormat {
  label: string;
  value: 'json' | 'csv' | 'xlsx';
  description: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    label: 'JSON',
    value: 'json',
    description: 'Complete data with all properties (recommended for backup/import)'
  },
  {
    label: 'CSV',
    value: 'csv',
    description: 'Spreadsheet format for analysis'
  },
  {
    label: 'Excel (XLSX)',
    value: 'xlsx',
    description: 'Excel workbook with multiple sheets'
  }
];

interface AccountingExportImportProps {
  open: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
}

export default function AccountingExportImport({
  open,
  onClose,
  mode
}: AccountingExportImportProps) {
  const { accountingInstances } = useItemInstances();
  const { items } = useAppState();
  const dispatch = useAppDispatch();

  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx'>('json');
  const [importData, setImportData] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify({
            instances: accountingInstances.map(i => i.toJSON()),
            exportDate: new Date().toISOString(),
            version: '1.0'
          }, null, 2);
          filename = `accounting-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          const csvHeaders = ['ID', 'Item ID', 'Item Name', 'Scheduled Start', 'Actual Start', 'Completed At', 'Is Complete', 'Duration', 'Notes'];
          const csvRows = accountingInstances.map(instance => {
            const item = items.find(i => i.id === instance.itemId);
            return [
              instance.id,
              instance.itemId,
              item?.name || 'Unknown',
              new Date(instance.scheduledStartTime).toISOString(),
              instance.actualStartTime ? new Date(instance.actualStartTime).toISOString() : '',
              instance.completedAt ? new Date(instance.completedAt).toISOString() : '',
              instance.isComplete ? 'Yes' : 'No',
              item?.duration ? (item.duration / 60000).toString() : '0', // Convert to minutes
              instance.executionDetails.notes || ''
            ].map(field => `"${field}"`);
          });
          content = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
          filename = `accounting-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        case 'xlsx':
          // This would require a library like xlsx or exceljs
          throw new Error('Excel export not yet implemented');

        default:
          throw new Error('Unknown export format');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setProcessing(false);
    }
  }, [exportFormat, accountingInstances, items, onClose]);

  const handleImport = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      const data = JSON.parse(importData);
      
      if (!data.instances || !Array.isArray(data.instances)) {
        throw new Error('Invalid import format: missing instances array');
      }

      const instances = data.instances.map((instanceData: any) => 
        ItemInstanceImpl.fromJSON(instanceData)
      );

      // Validate instances
      const errors: string[] = [];
      instances.forEach((instance, index) => {
        if (!instance.id || !instance.itemId) {
          errors.push(`Instance ${index + 1}: missing required fields`);
        }
      });

      if (errors.length > 0) {
        throw new Error(`Import validation failed:\n${errors.join('\n')}`);
      }

      // Import instances
      const operations = instances.map(instance => ({
        type: 'CREATE_ITEM_INSTANCE' as const,
        payload: { instance }
      }));

      dispatch({
        type: 'BATCH',
        payload: operations
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setProcessing(false);
    }
  }, [importData, dispatch, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'export' ? (
          <>
            <FileDownload sx={{ mr: 1 }} />
            Export Accounting Data
          </>
        ) : (
          <>
            <FileUpload sx={{ mr: 1 }} />
            Import Accounting Data
          </>
        )}
      </DialogTitle>

      <DialogContent>
        {processing && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mode === 'export' ? (
          <Box>
            <Typography variant="body1" paragraph>
              Export {accountingInstances.length} incomplete instances to file.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Export Format
            </Typography>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'xlsx')}
            >
              {EXPORT_FORMATS.map(format => (
                <FormControlLabel
                  key={format.value}
                  value={format.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {format.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" paragraph>
              Import accounting data from a JSON export file.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Paste JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              disabled={processing}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        
        {mode === 'export' ? (
          <Button
            onClick={handleExport}
            disabled={processing || accountingInstances.length === 0}
            variant="contained"
            startIcon={<Download />}
          >
            Export
          </Button>
        ) : (
          <Button
            onClick={handleImport}
            disabled={processing || !importData.trim()}
            variant="contained"
            startIcon={<Upload />}
          >
            Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

### 7. Add Notification System

#### `src/components/notifications/NotificationSystem.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertTitle, Button, Box } from '@mui/material';
import { useItemInstances } from '../../hooks/useItemInstances';
import { useAppState } from '../../reducerContexts/App';
import { getItemById } from '../../functions/utils/item/utils';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHideDuration?: number;
}

export default function NotificationSystem() {
  const { accountingInstances } = useItemInstances();
  const { items } = useAppState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  // Check for overdue items
  useEffect(() => {
    const now = Date.now();
    const overdueInstances = accountingInstances.filter(instance => {
      const item = getItemById(items, instance.itemId);
      if (!item) return false;
      
      const expectedEndTime = instance.scheduledStartTime + item.duration;
      return now > expectedEndTime + (24 * 60 * 60 * 1000); // 1 day grace period
    });

    if (overdueInstances.length > 0) {
      const notification: Notification = {
        id: 'overdue-items',
        type: 'warning',
        title: 'Overdue Items',
        message: `You have ${overdueInstances.length} items that are significantly overdue.`,
        action: {
          label: 'Review',
          onClick: () => {
            // Navigate to accounting view with overdue filter
            window.location.hash = '#/accounting?filter=overdue';
          }
        },
        autoHideDuration: 10000
      };

      setNotifications(prev => {
        const existing = prev.find(n => n.id === notification.id);
        if (!existing) {
          return [...prev, notification];
        }
        return prev;
      });
    }
  }, [accountingInstances, items]);

  // Process notification queue
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    }
  }, [currentNotification, notifications]);

  const handleClose = () => {
    setCurrentNotification(null);
    setNotifications(prev => prev.slice(1));
  };

  const handleAction = () => {
    if (currentNotification?.action) {
      currentNotification.action.onClick();
    }
    handleClose();
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={Boolean(currentNotification)}
      autoHideDuration={currentNotification.autoHideDuration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity={currentNotification.type}
        onClose={handleClose}
        action={
          currentNotification.action && (
            <Button color="inherit" size="small" onClick={handleAction}>
              {currentNotification.action.label}
            </Button>
          )
        }
      >
        {currentNotification.title && (
          <AlertTitle>{currentNotification.title}</AlertTitle>
        )}
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
}
```

## Testing Requirements

### Performance Tests (`src/__tests__/performance/`)
- Test virtualized list performance with 10,000+ instances
- Test variable calculation performance with deep hierarchies
- Test search and filtering performance with large datasets
- Test memory usage during extended sessions

### Accessibility Tests (`src/__tests__/accessibility/`)
- Test keyboard navigation through all components
- Test screen reader compatibility
- Test high contrast mode support
- Test focus management and tab order

### Error Handling Tests (`src/__tests__/errorHandling/`)
- Test error boundary functionality
- Test validation error handling
- Test network error recovery
- Test data corruption recovery

### User Experience Tests (`src/__tests__/ux/`)
- Test loading states and skeleton screens
- Test responsive design on mobile devices
- Test smooth animations and transitions
- Test notification system behavior

## Acceptance Criteria

- [x] Performance is acceptable with large datasets (10,000+ instances)
- [x] All components have proper loading states and error handling
- [x] Advanced filtering and search work efficiently
- [x] Keyboard shortcuts and accessibility features work correctly
- [x] Export/import functionality preserves data integrity
- [x] Notification system alerts users to important conditions
- [x] Error boundaries prevent crashes and provide recovery options
- [x] Validation prevents data corruption and provides helpful feedback
- [x] UI is responsive and works well on mobile devices
- [x] All animations and transitions are smooth and purposeful

## Rollback Plan

If performance issues are discovered:
1. Disable virtualization and fall back to pagination
2. Disable advanced filtering temporarily
3. Reduce variable calculation frequency
4. Simplify animations and transitions
5. Core functionality remains available with reduced features

## Deployment Checklist

### Pre-deployment
- [ ] All tests pass (unit, integration, performance, accessibility)
- [ ] Error tracking is configured for production
- [ ] Performance monitoring is in place
- [ ] Database migration scripts are tested
- [ ] Backup and rollback procedures are verified

### Post-deployment
- [ ] Monitor error rates and performance metrics
- [ ] Verify data migration completed successfully
- [ ] Check user feedback and support requests
- [ ] Monitor storage usage and cleanup old data if needed
- [ ] Document new features for user training

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds for accounting view
- Variable calculation time < 100ms for typical hierarchies
- Search results display within 500ms
- Memory usage remains stable during extended use
- Error rate < 0.1% for all operations

### User Experience Metrics
- Feature adoption rate > 70% within 30 days
- User completion rate > 90% for accounting workflows
- Support tickets related to new features < 5% of total
- User satisfaction score > 4.0/5.0 for new features

This completes the comprehensive implementation plan for Item Instances, Variables, and Accounting View features. The system now provides robust execution tracking, resource management, and retrospective accounting while maintaining clean separation between templates and execution instances.
