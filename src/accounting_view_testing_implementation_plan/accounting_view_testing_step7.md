# Step 7: User Settings Storage

## Step Title & Dependencies
**Title**: Extend local storage for badge threshold preferences  
**Dependencies**: Step 6 (Badge Logic and Calculation) must be completed first

## Detailed Requirements

### Badge Threshold Settings System
Implement a user preferences system that allows configuration of:
1. **Variable Quantity Thresholds**: Set minimum variable quantities that trigger badge notifications/highlighting
2. **Time Thresholds**: Set minimum time amounts that warrant badge notifications
3. **Variable-Specific Settings**: Configure thresholds for specific variable types or categories
4. **Badge Display Options**: Control badge visibility, color coding, and notification behavior

### Settings Data Structure
Design a settings schema that supports:
- Threshold values for different badge types
- Per-variable category configurations
- User preference persistence across sessions
- Backward compatibility with existing settings
- Settings validation and default values

### Integration with Existing Storage System
- Extend the existing local storage implementation
- Use the same patterns as other user preferences
- Ensure settings don't conflict with existing data
- Maintain data integrity and migration capabilities

## Code Changes Required

### New Types and Interfaces

#### `src/components/accounting/types/badgeSettings.ts`
- Export `BadgeSettings` interface for complete settings structure
- Export `VariableThresholdSettings` interface for variable-specific thresholds
- Export `TimeThresholdSettings` interface for time-based thresholds
- Export `BadgeDisplaySettings` interface for visual preferences
- Include validation schemas and default values

### New Storage Utilities

#### `src/components/accounting/storage/badgeSettingsStorage.ts`
- Export `saveBadgeSettings()` function for persisting settings
- Export `loadBadgeSettings()` function for retrieving settings
- Export `getDefaultBadgeSettings()` function for initial setup
- Export `validateBadgeSettings()` function for data integrity
- Export `migrateBadgeSettings()` function for schema updates

#### `src/components/accounting/storage/settingsManager.ts`
- Export `BadgeSettingsManager` class for centralized settings management
- Handle settings caching and performance optimization
- Provide settings change event system
- Include error handling and recovery mechanisms

### Integration with Context System

#### `src/components/accounting/contexts/BadgeSettingsContext.tsx`
- Create React context for badge settings state management
- Provide hooks for accessing and updating settings
- Handle settings persistence automatically
- Include loading states and error handling

### Files to Modify

#### `src/localStorageImplementation/types.ts`
- Add BadgeSettings to existing settings interfaces
- Ensure proper TypeScript integration
- Maintain backward compatibility

#### `src/localStorageImplementation/localStorageService.ts`
- Add badge settings to storage service operations
- Include badge settings in backup/restore functionality
- Handle settings migration during app updates

### Implementation Details

#### Settings Schema Design
```typescript
// Example settings structure (not actual code):
interface BadgeSettings {
  timeThresholds: {
    minimal: number; // e.g., 5 minutes
    significant: number; // e.g., 30 minutes
    critical: number; // e.g., 2 hours
  };
  variableThresholds: {
    defaultMinimum: number; // e.g., 3 variables
    categorySpecific: Record<string, number>;
    alertThresholds: Record<string, number>;
  };
  displaySettings: {
    showTimebadge: boolean;
    showVariableBadge: boolean;
    colorCoding: boolean;
    notificationLevel: 'none' | 'minimal' | 'normal' | 'verbose';
  };
}
```

#### Storage Integration Strategy
- Use existing localStorage patterns from the application
- Implement proper JSON serialization and deserialization
- Handle storage quota limits and error conditions
- Provide clear migration path for settings updates

#### Performance Considerations
- Cache settings in memory for frequent access
- Debounce settings saves to avoid excessive localStorage writes
- Lazy load settings when needed
- Minimize settings validation overhead

## Testing Requirements

### Settings Storage Tests
- Test save and load operations with various settings configurations
- Verify settings persistence across browser sessions
- Test settings validation with invalid data
- Verify default settings are applied correctly

### Migration and Compatibility Tests
- Test migration from old settings formats (if applicable)
- Verify backward compatibility with existing localStorage data
- Test settings recovery after corruption or errors
- Verify settings don't interfere with other application data

### Integration Tests
- Test settings context integration with React components
- Verify settings changes trigger appropriate badge updates
- Test settings loading performance and caching
- Verify error handling and fallback behavior

### Test Files to Create
- `src/components/accounting/storage/__tests__/badgeSettingsStorage.test.ts`
- `src/components/accounting/storage/__tests__/settingsManager.test.ts`
- `src/components/accounting/contexts/__tests__/BadgeSettingsContext.test.tsx`

## Acceptance Criteria

### Storage Functionality Requirements
- [ ] Badge settings persist correctly across browser sessions
- [ ] Settings load automatically when application starts
- [ ] Settings save automatically when changed by user
- [ ] Default settings are applied for new users
- [ ] Settings validation prevents invalid configurations

### Data Integrity Requirements
- [ ] Settings don't conflict with existing localStorage data
- [ ] Settings corruption is detected and handled gracefully
- [ ] Migration system works for settings schema updates
- [ ] Backup and restore includes badge settings
- [ ] Settings are properly typed and validated

### Performance Requirements
- [ ] Settings load within 100ms during application startup
- [ ] Settings saves don't block UI interactions
- [ ] Memory usage for settings caching is minimal
- [ ] No performance impact on existing localStorage operations

### Integration Requirements
- [ ] Settings context provides easy access to all badge settings
- [ ] Settings changes trigger badge recalculation appropriately
- [ ] Error states are handled gracefully with fallbacks
- [ ] Settings work correctly in both development and production builds

## Rollback Plan

### Storage Issues Recovery
1. **localStorage Conflicts**: Use sessionStorage or memory-only storage
2. **Performance Problems**: Implement simpler settings structure or reduce caching
3. **Data Corruption**: Add more robust validation and recovery mechanisms
4. **Migration Issues**: Provide manual settings reset option

### Integration Issues Recovery
1. **Context Integration Problems**: Use component-level state instead of context
2. **Settings Persistence Issues**: Use session-only settings without persistence
3. **Validation Problems**: Simplify settings structure and validation rules
4. **Performance Impact**: Reduce settings complexity or frequency of access

### Compatibility Issues Recovery
1. **Existing Data Conflicts**: Use separate storage namespace for badge settings
2. **TypeScript Issues**: Simplify types or make settings optional
3. **Browser Compatibility**: Provide fallback storage mechanisms
4. **Settings Schema Problems**: Use simpler, more flexible settings structure

### Clean Rollback Steps
1. Remove all badge settings storage utilities
2. Remove badge settings context and hooks
3. Restore any modified localStorage service code
4. Remove badge settings types and interfaces
5. Verify existing settings functionality is unaffected
6. Ensure badge components work with hardcoded defaults

### Partial Implementation Strategy
If full implementation proves challenging:
1. Start with simple key-value settings storage
2. Implement context integration after basic storage works
3. Add migration and validation incrementally
4. Use hardcoded defaults initially, add user configuration later
5. Implement memory-only settings before localStorage persistence
6. Focus on core functionality before performance optimization
