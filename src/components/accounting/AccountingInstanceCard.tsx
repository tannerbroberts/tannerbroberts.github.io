import { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Warning,
  AccessTime
} from '@mui/icons-material';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';
import { useItemVariables } from '../../hooks/useItemVariables';
import { ItemInstance } from '../../functions/utils/item/index';
import { getItemById } from '../../functions/utils/item/utils';
import { hasChildren, getChildren } from '../../functions/utils/item/itemUtils';

interface AccountingInstanceCardProps {
  readonly instance: ItemInstance;
}

export default function AccountingInstanceCard({ instance }: AccountingInstanceCardProps) {
  const { items, itemInstances } = useAppState();
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const item = useMemo(() => {
    return getItemById(items, instance.itemId);
  }, [items, instance.itemId]);

  const { variableSummary } = useItemVariables(instance.itemId);

  // Calculate time information
  const timeInfo = useMemo(() => {
    const now = Date.now();
    const scheduledStart = instance.scheduledStartTime;
    const actualStart = instance.actualStartTime;
    const duration = item?.duration || 0;
    const scheduledEnd = scheduledStart + duration;
    const actualEnd = actualStart ? actualStart + duration : null;

    const overdue = now > scheduledEnd;
    const overdueBy = overdue ? now - scheduledEnd : 0;

    return {
      scheduledStart,
      actualStart,
      scheduledEnd,
      actualEnd,
      duration,
      overdue,
      overdueBy,
      wasStarted: Boolean(actualStart)
    };
  }, [instance, item]);

  // Check if this instance has child instances
  const childInstances = useMemo(() => {
    if (!item || !hasChildren(item)) return [];

    const children = getChildren(item);
    const childIds = children.map((child: any) => 'id' in child ? child.id : child.itemId);

    return Array.from(itemInstances.values()).filter((inst: any) =>
      childIds.includes(inst.itemId) &&
      inst.calendarEntryId === instance.calendarEntryId
    );
  }, [item, itemInstances, instance]);

  const handleMarkComplete = useCallback(() => {
    dispatch({
      type: 'MARK_INSTANCE_COMPLETED',
      payload: { instanceId: instance.id }
    });
    setShowConfirm(false);
  }, [dispatch, instance.id]);

  const handleMarkCompleteWithChildren = useCallback(() => {
    const operations = [
      {
        type: 'MARK_INSTANCE_COMPLETED' as const,
        payload: { instanceId: instance.id }
      },
      ...childInstances.map((childInstance: any) => ({
        type: 'MARK_INSTANCE_COMPLETED' as const,
        payload: { instanceId: childInstance.id }
      }))
    ];

    dispatch({
      type: 'BATCH',
      payload: operations
    });
    setShowConfirm(false);
  }, [dispatch, instance.id, childInstances]);

  if (!item) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="error">
            Item not found for instance {instance.id}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="h3">
                {item.name}
              </Typography>

              {/* Status Chips */}
              {timeInfo.overdue && (
                <Chip
                  icon={<Warning />}
                  label={`Overdue by ${formatDuration(timeInfo.overdueBy)}`}
                  color="error"
                  size="small"
                />
              )}

              {timeInfo.wasStarted && (
                <Chip
                  icon={<AccessTime />}
                  label="Was Started"
                  color="info"
                  size="small"
                />
              )}

              {childInstances.length > 0 && (
                <Chip
                  label={`${childInstances.length} children`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            {/* Time Information */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Scheduled: {new Date(timeInfo.scheduledStart).toLocaleString()}
              </Typography>
              {timeInfo.wasStarted && (
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(timeInfo.actualStart!).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Duration: {formatDuration(timeInfo.duration)}
              </Typography>
            </Box>

            {/* Variables Summary (if expanded) */}
            {expanded && Object.keys(variableSummary).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resource Impact
                </Typography>
                {Object.entries(variableSummary).map(([name, data]) => (
                  <Chip
                    key={name}
                    label={`${data.quantity} ${name}`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}

            {/* Child Instances (if expanded) */}
            {expanded && childInstances.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Child Instances
                </Typography>
                {childInstances.map((childInstance: any) => {
                  const childItem = getItemById(items, childInstance.itemId);
                  return (
                    <Box
                      key={childInstance.id}
                      sx={{
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Typography variant="body2">
                        {childItem?.name || 'Unknown Item'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {childInstance.isComplete ? 'Complete' : 'Incomplete'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
            {/* Expand/Collapse */}
            {(Object.keys(variableSummary).length > 0 || childInstances.length > 0) && (
              <IconButton
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}

            {/* Completion Actions */}
            {!showConfirm ? (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setShowConfirm(true)}
                color="success"
                size="small"
              >
                Mark Complete
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleMarkComplete}
                  color="success"
                  size="small"
                  fullWidth
                >
                  This Only
                </Button>

                {childInstances.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleMarkCompleteWithChildren}
                    color="success"
                    size="small"
                    fullWidth
                  >
                    + {childInstances.length} Children
                  </Button>
                )}

                <Button
                  variant="text"
                  onClick={() => setShowConfirm(false)}
                  size="small"
                  fullWidth
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
