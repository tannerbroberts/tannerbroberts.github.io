# Integration Instructions

## Step 1: Update Main App Component

Replace the existing App component structure:

### Before (src/components/App.tsx or similar):
```typescript
import { AppProvider } from '../reducerContexts/App';

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
```

### After:
```typescript
import { StorageSystemInitializer } from '../localStorageImplementation/integration';

function App() {
  return (
    <StorageSystemInitializer>
      <MainAppContent />
    </StorageSystemInitializer>
  );
}
```

## Step 2: Update ExecutionView (Optional)

To use the enhanced execution view with automatic loading:

### Replace existing ExecutionView import:
```typescript
// Before
import ExecutionView from './ExecutionView';

// After
import { EnhancedExecutionView } from '../localStorageImplementation/components/EnhancedExecutionView';

// Use in component
<EnhancedExecutionView showHeader={true} />
```

## Step 3: Add Debug Tools (Development Only)

Add debug tools to development builds:

```typescript
import { StorageDebugPanel } from '../localStorageImplementation/components/StorageDebugPanel';

function App() {
  return (
    <StorageSystemInitializer>
      <MainAppContent />
      {process.env.NODE_ENV === 'development' && (
        <StorageDebugPanel position="bottom-right" />
      )}
    </StorageSystemInitializer>
  );
}
```

## Step 4: Feature Flag Configuration

Configure feature flags as needed:

```typescript
import { featureFlags } from '../localStorageImplementation/integration';

// Enable automatic migration for existing users
featureFlags.setOverride('enableAutoMigration', true);

// Enable debug tools in development
if (process.env.NODE_ENV === 'development') {
  featureFlags.setOverride('enableDebugTools', true);
  featureFlags.setOverride('enablePerformanceMonitoring', true);
}
```

## Step 5: Manual Migration Control

For manual control over when migration happens:

```typescript
import { 
  enableStorageSystem, 
  disableStorageSystem, 
  getMigrationStatus 
} from '../localStorageImplementation/integration';

// Check if migration is needed
const status = await getMigrationStatus();
console.log('Migration needed:', status.needsMigration);

// Enable storage system manually
await enableStorageSystem();

// Disable storage system
disableStorageSystem();
```

## Integration Options

### Option 1: Auto-Migration (Recommended)
```typescript
// In your main App component
import { StorageSystemInitializer, featureFlags } from '../localStorageImplementation/integration';

// Enable auto-migration
featureFlags.setOverride('enableAutoMigration', true);

function App() {
  return (
    <StorageSystemInitializer>
      <YourAppContent />
    </StorageSystemInitializer>
  );
}
```

### Option 2: Manual Migration
```typescript
// Keep auto-migration disabled and provide UI controls
import { AppMigrator } from '../localStorageImplementation/integration';

function App() {
  const [showMigrator, setShowMigrator] = useState(false);
  
  return (
    <StorageSystemInitializer>
      <YourAppContent />
      <Button onClick={() => setShowMigrator(true)}>
        Enable Data Persistence
      </Button>
      {showMigrator && (
        <AppMigrator
          onMigrationComplete={() => setShowMigrator(false)}
          onMigrationSkipped={() => setShowMigrator(false)}
        />
      )}
    </StorageSystemInitializer>
  );
}
```

### Option 3: Feature Flag Control
```typescript
// Use feature flags to control rollout
import { featureFlags } from '../localStorageImplementation/integration';

// Enable for specific users/conditions
if (shouldEnableForUser()) {
  featureFlags.setOverride('enableLocalStorage', true);
  featureFlags.setOverride('enableAutoMigration', true);
}
```

## Testing the Integration

### Development Testing
1. Clear localStorage: `localStorage.clear()`
2. Reload the app
3. Check if migration dialog appears (if auto-migration enabled)
4. Test both migration and skip options
5. Verify data persistence after reload

### Production Rollout
1. Start with manual migration only
2. Monitor for issues
3. Gradually enable auto-migration for user segments
4. Full rollout after validation

## Troubleshooting

### Migration Dialog Not Appearing
- Check `enableAutoMigration` feature flag
- Verify `checkMigrationStatus()` returns `needsMigration: true`
- Check browser console for errors

### Data Not Persisting
- Verify `enableLocalStorage` feature flag is true
- Check localStorage quota/availability
- Look for storage errors in console

### Performance Issues
- Check `enablePerformanceMonitoring` for metrics
- Use debug tools to monitor storage operations
- Consider disabling auto-migration during peak times

## Rollback Plan

If issues occur:
1. Disable storage system: `disableStorageSystem()`
2. Use rollback functionality in migration dialog
3. Clear localStorage if needed: `localStorage.clear()`
4. App will fall back to non-persistent mode

## Monitoring

Add monitoring for:
- Migration success/failure rates
- Storage operation performance
- User adoption of persistence feature
- Error rates during migration

```typescript
// Example monitoring integration
import { migrationService } from '../localStorageImplementation/integration';

migrationService.onMigrationComplete((result) => {
  analytics.track('migration_complete', {
    success: result.success,
    executionTime: result.executionTime,
    errors: result.errors.length
  });
});
```
