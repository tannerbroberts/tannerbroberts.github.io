# Step 4: SubCalendar Status Bar Enhancement

## Step Title & Dependencies
**Title**: Enhanced Status Bar with Countdown and Visual Indicators  
**Dependencies**: Step 3 (Execution View Enhancement) complete

## Detailed Requirements

### Current Status Bar Limitations
1. **Static Information**: Shows only current progress, not upcoming tasks
2. **Limited Context**: Doesn't provide preparation guidance for upcoming children
3. **Visual Hierarchy**: Unclear distinction between different child states
4. **Timing Information**: Limited real-time countdown information

### Enhanced Status Bar Features

#### Dynamic Child Status Display
- **Active Child Indicator**: Prominent display when a child is executing
- **Countdown Display**: Clear countdown to next child with visual timer
- **Preparation Context**: Brief guidance on what to prepare during gaps
- **Progress Integration**: Show how current child fits into overall progress

#### Visual Design Enhancements
- **Color Coding**: Different colors for active, upcoming, and gap states
- **Progress Animations**: Smooth animations for countdown timers
- **Icon Integration**: Appropriate icons for different child states
- **Layout Optimization**: Better use of space for multiple information types

#### Contextual Information
- **Phase Awareness**: Show which phase of cooking we're in
- **Multi-task Guidance**: Show when multiple tasks should happen simultaneously
- **Critical Timing**: Highlight tasks that have critical timing requirements

### New Status Bar States

#### Active Child State
- **Display**: "Executing: [Child Name]"
- **Progress**: Progress bar for current child
- **Time Info**: Time remaining for current child
- **Visual**: Green accent color, active animation

#### Countdown State
- **Display**: "Next: [Child Name] in [Countdown]"
- **Progress**: Overall subcalendar progress
- **Time Info**: Countdown to next child start
- **Visual**: Blue accent color, countdown animation

#### Gap State
- **Display**: "Monitoring: [Context]"
- **Progress**: Overall subcalendar progress
- **Time Info**: Time until next major milestone
- **Visual**: Orange accent color, monitoring animation

#### Preparation State
- **Display**: "Prepare: [Next Task] in [Countdown]"
- **Progress**: Overall subcalendar progress
- **Time Info**: Preparation countdown
- **Visual**: Yellow accent color, preparation animation

## Code Changes Required

### File: `src/components/execution/SubCalendarStatusBar.tsx`

#### Enhanced Props Interface
```typescript
interface SubCalendarStatusBarProps {
  // ... existing props
  childExecutionStatus?: ChildExecutionStatus; // From Step 3
  showCountdown?: boolean;
  showPreparationHints?: boolean;
}

// Add state type for status bar
type StatusBarState = 'active' | 'countdown' | 'gap' | 'preparation' | 'complete';
```

#### New State Management
```typescript
// Enhanced state calculation
const statusBarState = useMemo((): StatusBarState => {
  if (!childExecutionStatus) return 'gap';
  
  const { activeChild, nextChild, gapPeriod, currentPhase } = childExecutionStatus;
  
  if (activeChild) return 'active';
  if (nextChild && nextChild.timeUntilStart < 30000) return 'preparation'; // 30 seconds
  if (nextChild) return 'countdown';
  if (gapPeriod) return 'gap';
  return 'complete';
}, [childExecutionStatus]);

// Enhanced display content calculation
const displayContent = useMemo(() => {
  if (!childExecutionStatus) {
    return {
      primaryText: itemName || 'SubCalendar',
      secondaryText: null,
      countdownText: null,
      color: 'primary'
    };
  }
  
  const { activeChild, nextChild, gapPeriod } = childExecutionStatus;
  
  switch (statusBarState) {
    case 'active':
      return {
        primaryText: `Executing: ${activeChild?.name}`,
        secondaryText: 'Follow instructions carefully',
        countdownText: null,
        color: 'success'
      };
      
    case 'preparation':
      return {
        primaryText: `Prepare: ${nextChild?.item.name}`,
        secondaryText: 'Get ready for next task',
        countdownText: formatCountdown(nextChild.timeUntilStart),
        color: 'warning'
      };
      
    case 'countdown':
      return {
        primaryText: `Next: ${nextChild?.item.name}`,
        secondaryText: 'Continue monitoring current tasks',
        countdownText: formatCountdown(nextChild.timeUntilStart),
        color: 'info'
      };
      
    case 'gap':
      return {
        primaryText: 'Monitoring cooking',
        secondaryText: 'Watch for cooking progress',
        countdownText: nextChild ? formatCountdown(nextChild.timeUntilStart) : null,
        color: 'primary'
      };
      
    default:
      return {
        primaryText: 'SubCalendar Complete',
        secondaryText: 'All tasks finished',
        countdownText: null,
        color: 'success'
      };
  }
}, [statusBarState, childExecutionStatus, itemName]);
```

#### Enhanced Visual Components
```typescript
// Add countdown timer component
const CountdownTimer = ({ timeMs, color }: { timeMs: number; color: string }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1,
    px: 1,
    py: 0.5,
    borderRadius: 1,
    backgroundColor: `${color}.50`,
    border: `1px solid`,
    borderColor: `${color}.200`
  }}>
    <Timer fontSize="small" sx={{ color: `${color}.main` }} />
    <Typography 
      variant="body2" 
      sx={{ 
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: `${color}.main`,
        minWidth: '60px'
      }}
    >
      {formatCountdown(timeMs)}
    </Typography>
  </Box>
);

// Add preparation indicator
const PreparationIndicator = ({ visible }: { visible: boolean }) => (
  <Box sx={{
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  }}>
    <Box sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'warning.main',
      animation: 'pulse 2s infinite'
    }} />
    <Typography variant="caption" color="warning.main">
      PREP
    </Typography>
  </Box>
);
```

#### Enhanced Layout Structure
```typescript
// Update main content layout
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
  {/* Progress percentage */}
  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
    {overallProgress.toFixed(1)}%
  </Typography>

  {/* Primary status display */}
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography variant="h6" sx={{ 
      fontWeight: 'bold',
      color: `${displayContent.color}.main`,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }}>
      {displayContent.primaryText}
    </Typography>
    
    {displayContent.secondaryText && (
      <Typography variant="caption" color="text.secondary">
        {displayContent.secondaryText}
      </Typography>
    )}
  </Box>

  {/* Countdown timer */}
  {displayContent.countdownText && (
    <CountdownTimer 
      timeMs={childExecutionStatus?.nextChild?.timeUntilStart || 0}
      color={displayContent.color}
    />
  )}

  {/* Preparation indicator */}
  <PreparationIndicator visible={statusBarState === 'preparation'} />
</Box>
```

### File: `src/components/execution/PrimarySubCalendarItemDisplay.tsx`

#### Integration with Enhanced Status Bar
```typescript
// Pass child execution status to status bar
<SubCalendarStatusBar
  item={item}
  taskChain={taskChain}
  currentTime={currentTime}
  startTime={startTime}
  itemName={item.name}
  isExpandable={false}
  isExpanded={false}
  childExecutionStatus={childExecutionStatus} // New prop
  showCountdown={true} // New prop
  showPreparationHints={true} // New prop
/>
```

#### Enhanced Context Display
```typescript
// Add context information below status bar
{childExecutionStatus?.gapPeriod && (
  <Box sx={{
    mt: 1,
    p: 1.5,
    backgroundColor: 'info.50',
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'info.200'
  }}>
    <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium' }}>
      💡 {getGapPeriodGuidance(childExecutionStatus)}
    </Typography>
  </Box>
)}
```

### New Helper Functions

#### Countdown Formatting
```typescript
// Enhanced countdown formatting with multiple time units
const formatCountdown = (milliseconds: number): string => {
  if (milliseconds <= 0) return '0s';
  
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    return `${seconds}s`;
  }
};

// Context guidance for gap periods
const getGapPeriodGuidance = (status: ChildExecutionStatus): string => {
  const { nextChild } = status;
  
  if (!nextChild) return 'Monitor current cooking tasks';
  
  const timeUntil = nextChild.timeUntilStart;
  
  if (timeUntil < 30000) { // 30 seconds
    return `Get ready for ${nextChild.item.name} - starting very soon!`;
  } else if (timeUntil < 120000) { // 2 minutes
    return `Prepare for ${nextChild.item.name} - gather needed items`;
  } else {
    return `Continue monitoring current tasks - ${nextChild.item.name} starts in ${formatCountdown(timeUntil)}`;
  }
};
```

## Testing Requirements

### Visual Testing
1. **State Transitions**: Test visual transitions between all status bar states
2. **Color Coding**: Verify appropriate colors for each state
3. **Animation Smoothness**: Verify countdown animations are smooth
4. **Layout Responsiveness**: Test layout with different text lengths
5. **Icon Integration**: Verify icons display correctly in all states

### Functional Testing
1. **Countdown Accuracy**: Verify countdown timers are mathematically accurate
2. **State Logic**: Verify correct state detection for all child execution scenarios
3. **Real-time Updates**: Verify status bar updates correctly as time progresses
4. **Preparation Warnings**: Verify preparation state activates at appropriate times
5. **Context Guidance**: Verify appropriate guidance messages for gap periods

### Integration Testing
1. **Primary Display Integration**: Test integration with main execution display
2. **Status Bar Props**: Test all new props work correctly
3. **Child Execution Status**: Test integration with enhanced execution status
4. **Performance Impact**: Verify enhancements don't impact performance
5. **Multiple SubCalendars**: Test behavior with nested subcalendar items

### Manual Testing Steps
1. **Start Breakfast Lesson**: Monitor status bar through entire lesson
2. **Active Child Display**: Verify clear display when children are executing
3. **Countdown Display**: Verify countdown accuracy and visual appeal
4. **Gap Period Display**: Verify appropriate messaging during gaps
5. **Preparation Warnings**: Verify 30-second preparation warnings work
6. **State Transitions**: Pay attention to smoothness of transitions

### Test Commands
All tests should be run using:
```bash
npm run test:ai
```

### File Cleanup Commands
All file removals should use the `-f` flag:
```bash
rm -f <file_name>
```

## Acceptance Criteria

### Visual Quality
- [x] Status bar clearly shows current execution state
- [x] Countdown timers are visually appealing and easy to read
- [x] Color coding provides intuitive state differentiation
- [x] Animations are smooth and not distracting
- [x] Layout remains clean and uncluttered

### Functional Accuracy
- [x] Countdown timers are mathematically accurate
- [x] State detection logic works correctly in all scenarios
- [x] Preparation warnings activate at appropriate times
- [x] Context guidance is helpful and relevant
- [x] Real-time updates work smoothly

### User Experience
- [x] Always clear what's happening right now
- [x] Always clear what's happening next and when
- [x] Appropriate preparation time and guidance
- [x] Helpful context during waiting periods
- [x] No information overload or confusion

### Technical Quality
- [x] No performance degradation from enhancements
- [x] Clean integration with existing components
- [x] Proper TypeScript typing for all new features
- [x] No memory leaks from animations or timers
- [x] Responsive design works on different screen sizes

### Cooking-Specific Quality
- [x] Critical cooking timing is clearly highlighted
- [x] Multi-tasking periods are clearly communicated
- [x] Preparation guidance is cooking-appropriate
- [x] Gap periods provide relevant cooking context
- [x] Overall flow supports successful cooking execution

## Rollback Plan

### Visual Rollback
1. **Remove Countdown Display**: Can disable countdown while keeping state logic
2. **Simplify Color Coding**: Can revert to single color scheme
3. **Remove Animations**: Can disable animations if they cause issues
4. **Simplify Layout**: Can revert to simpler status bar layout

### Functional Rollback
1. **Disable State Detection**: Can revert to simpler state logic
2. **Remove Context Guidance**: Can remove guidance messages
3. **Simplify Preparation Logic**: Can remove preparation warnings
4. **Basic Status Only**: Can show only basic status information

### Component Rollback
- **Props Backward Compatibility**: All new props are optional
- **Original Functionality**: All original status bar functionality preserved
- **Progressive Degradation**: Can remove enhancements incrementally

### Testing After Rollback
- **Basic Status Bar**: Verify original status bar functionality works
- **Performance**: Verify performance returns to baseline
- **Integration**: Verify integration with other components still works
