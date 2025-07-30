import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';
import { useItemInstances } from '../../hooks/useItemInstances';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { getItemById } from '../../functions/utils/item/utils';
import { hasChildren, getChildren } from '../../functions/utils/item/itemUtils';
import AccountingInstanceCard from './AccountingInstanceCard';
import VariableAccountingSummary from './VariableAccountingSummary';
import AccountingViewHeader from './AccountingViewHeader';
import BadgeSettingsDialog from './settings/BadgeSettingsDialog';
import ErrorBoundary from '../common/ErrorBoundary';

type TimeGroup = 'today' | 'yesterday' | 'thisWeek' | 'older';
type SortOrder = 'newest' | 'oldest' | 'name' | 'duration';

interface AccountingViewProps {
  readonly className?: string;
}

export default function AccountingView({ className }: AccountingViewProps) {
  const { items, itemVariables } = useAppState();
  const { accountingInstances } = useItemInstances();
  const dispatch = useAppDispatch();

  // Expand/collapse state (starts collapsed by default)
  const [isExpanded, setIsExpanded] = useState(false);

  // Settings dialog state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Filter and search state with debouncing
  const [searchQueryRaw, setSearchQueryRaw] = useState('');
  const searchQuery = useDebouncedValue(searchQueryRaw, 300);
  const [selectedTimeGroup, setSelectedTimeGroup] = useState<TimeGroup | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showOnlyWithVariables] = useState(false);

  // Hierarchical filtering: Show largest possible incomplete parents
  const hierarchicallyFilteredInstances = useMemo(() => {
    const instanceMap = new Map(accountingInstances.map(inst => [inst.id, inst]));
    const visibleInstances = new Set<string>();

    // First pass: identify all parent-child relationships
    const childParentMap = new Map<string, string>(); // childId -> parentId

    for (const instance of accountingInstances) {
      const item = getItemById(items, instance.itemId);
      if (!item || !hasChildren(item)) continue;

      const children = getChildren(item);
      const childInstanceIds = children
        .map(child => {
          const childId = 'id' in child ? child.id : child.itemId;
          return accountingInstances.find(inst =>
            inst.itemId === childId &&
            inst.calendarEntryId === instance.calendarEntryId
          )?.id;
        })
        .filter(Boolean);

      if (childInstanceIds.length > 0) {
        childInstanceIds.forEach(childId => {
          if (childId) {
            childParentMap.set(childId, instance.id);
          }
        });
      }
    }

    // Second pass: determine which instances to show (largest parents only)
    for (const instance of accountingInstances) {
      // If this instance has a parent that's also incomplete and past, skip this instance
      const parentInstanceId = childParentMap.get(instance.id);
      if (parentInstanceId && instanceMap.has(parentInstanceId)) {
        const parentInstance = instanceMap.get(parentInstanceId)!;
        // Skip this child if parent is also incomplete and past
        if (!parentInstance.isComplete && parentInstance.scheduledStartTime <= Date.now()) {
          continue;
        }
      }

      visibleInstances.add(instance.id);
    }

    return accountingInstances.filter(instance => visibleInstances.has(instance.id));
  }, [accountingInstances, items]);

  // Group instances by time periods
  const groupedInstances = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

    const groups: Record<TimeGroup, typeof hierarchicallyFilteredInstances> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    for (const instance of hierarchicallyFilteredInstances) {
      const instanceDate = new Date(instance.scheduledStartTime);
      const instanceDay = new Date(instanceDate.getFullYear(), instanceDate.getMonth(), instanceDate.getDate());

      if (instanceDay.getTime() === today.getTime()) {
        groups.today.push(instance);
      } else if (instanceDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(instance);
      } else if (instanceDay >= thisWeekStart) {
        groups.thisWeek.push(instance);
      } else {
        groups.older.push(instance);
      }
    }

    return groups;
  }, [hierarchicallyFilteredInstances]);

  // Filter and sort instances
  const filteredInstances = useMemo(() => {
    let instances = selectedTimeGroup === 'all'
      ? hierarchicallyFilteredInstances
      : groupedInstances[selectedTimeGroup];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      instances = instances.filter(instance => {
        const item = getItemById(items, instance.itemId);
        return item?.name.toLowerCase().includes(query);
      });
    }

    // Apply variable filter
    if (showOnlyWithVariables) {
      instances = instances.filter(instance => {
        const item = getItemById(items, instance.itemId);
        // This would check if item has variables - implementation depends on variable storage
        return item; // Placeholder
      });
    }

    // Sort instances
    instances.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.scheduledStartTime - a.scheduledStartTime;
        case 'oldest':
          return a.scheduledStartTime - b.scheduledStartTime;
        case 'name': {
          const itemA = getItemById(items, a.itemId);
          const itemB = getItemById(items, b.itemId);
          return (itemA?.name || '').localeCompare(itemB?.name || '');
        }
        case 'duration': {
          const itemADuration = getItemById(items, a.itemId)?.duration || 0;
          const itemBDuration = getItemById(items, b.itemId)?.duration || 0;
          return itemBDuration - itemADuration;
        }
        default:
          return 0;
      }
    });

    return instances;
  }, [hierarchicallyFilteredInstances, groupedInstances, selectedTimeGroup, searchQuery, showOnlyWithVariables, sortOrder, items]);

  // Badge click handler for debugging/info
  const handleBadgeClick = useCallback((badgeType: 'time' | 'variables') => {
    console.log(`Badge clicked: ${badgeType}`);
    // Future: Could open detailed breakdown or filtering based on badge type
  }, []);

  // Settings dialog handlers
  const handleSettingsClick = useCallback(() => {
    setSettingsDialogOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsDialogOpen(false);
  }, []);

  // Bulk completion handlers
  const handleCompleteAll = useCallback(async () => {
    if (!confirm(`Mark all ${filteredInstances.length} instances as complete?`)) {
      return;
    }

    const operations = filteredInstances.map(instance => ({
      type: 'MARK_INSTANCE_COMPLETED' as const,
      payload: { instanceId: instance.id }
    }));

    dispatch({
      type: 'BATCH',
      payload: operations
    });
  }, [filteredInstances, dispatch]);

  const handleCompleteTimeGroup = useCallback(async (timeGroup: TimeGroup) => {
    const instances = groupedInstances[timeGroup];
    if (!confirm(`Mark all ${instances.length} instances from ${timeGroup} as complete?`)) {
      return;
    }

    const operations = instances.map(instance => ({
      type: 'MARK_INSTANCE_COMPLETED' as const,
      payload: { instanceId: instance.id }
    }));

    dispatch({
      type: 'BATCH',
      payload: operations
    });
  }, [groupedInstances, dispatch]);

  // Statistics
  const stats = useMemo(() => {
    const totalInstances = accountingInstances.length;
    const totalOverdue = accountingInstances.filter(
      instance => Date.now() - instance.scheduledStartTime > (getItemById(items, instance.itemId)?.duration || 0)
    ).length;

    return {
      totalInstances,
      totalOverdue,
      filteredCount: filteredInstances.length
    };
  }, [accountingInstances, filteredInstances, items]);

  return (
    <ErrorBoundary>
      <Box className={className} sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Collapsible Header */}
        <AccountingViewHeader
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          totalIncompleteCount={stats.totalInstances}
          overdueCount={stats.totalOverdue}
          filteredCount={stats.filteredCount}
          instances={accountingInstances}
          items={items}
          itemVariables={itemVariables}
          onBadgeClick={handleBadgeClick}
          onSettingsClick={handleSettingsClick}
        />

        {/* Collapsible Content */}
        <Collapse in={isExpanded} timeout={300}>
          <Box>
            {/* Expanded description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Review and complete past scheduled items that haven't been marked as finished.
            </Typography>

            {/* Variable Accounting Summary */}
            <VariableAccountingSummary instances={accountingInstances} />

            {/* Filters and Search */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Search */}
                  <TextField
                    size="small"
                    placeholder="Search instances..."
                    value={searchQueryRaw}
                    onChange={(e) => setSearchQueryRaw(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }
                    }}
                    sx={{ minWidth: 200 }}
                  />

                  {/* Time Group Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={selectedTimeGroup}
                      onChange={(e) => setSelectedTimeGroup(e.target.value as TimeGroup | 'all')}
                      label="Time Period"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="thisWeek">This Week</MenuItem>
                      <MenuItem value="older">Older</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Order */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      label="Sort By"
                    >
                      <MenuItem value="newest">Newest</MenuItem>
                      <MenuItem value="oldest">Oldest</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="duration">Duration</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Bulk Actions */}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCompleteAll}
                      disabled={filteredInstances.length === 0}
                      startIcon={<CheckCircle />}
                    >
                      Complete All Filtered
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Instances List */}
            {filteredInstances.length === 0 ? (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      All Caught Up!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {accountingInstances.length === 0
                        ? "No incomplete instances found."
                        : "No instances match your current filters."
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedTimeGroup === 'all' ? (
                  // Group by time periods when showing all
                  Object.entries(groupedInstances).map(([timeGroup, instances]) => {
                    if (instances.length === 0) return null;

                    return (
                      <Box key={timeGroup}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                            {timeGroup === 'thisWeek' ? 'This Week' : timeGroup}
                          </Typography>
                          <Chip
                            label={instances.length}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                          <Button
                            size="small"
                            onClick={() => handleCompleteTimeGroup(timeGroup as TimeGroup)}
                            sx={{ ml: 'auto' }}
                          >
                            Complete All
                          </Button>
                        </Box>
                        {instances.map(instance => (
                          <AccountingInstanceCard
                            key={instance.id}
                            instance={instance}
                          />
                        ))}
                      </Box>
                    );
                  })
                ) : (
                  // Show filtered list without grouping
                  filteredInstances.map(instance => (
                    <AccountingInstanceCard
                      key={instance.id}
                      instance={instance}
                    />
                  ))
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Settings Dialog */}
      <BadgeSettingsDialog
        open={settingsDialogOpen}
        onClose={handleSettingsClose}
      />
    </ErrorBoundary>
  );
}
