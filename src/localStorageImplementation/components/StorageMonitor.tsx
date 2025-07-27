import { useState, useEffect, ReactElement, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Storage,
  Memory,
  Speed,
  TrendingUp,
  TrendingDown,
  Timeline,
  Refresh
} from '@mui/icons-material';

interface StorageMonitorProps {
  refreshInterval?: number; // in milliseconds
  onAlert?: (alert: StorageAlert) => void;
}

interface StorageMetrics {
  usedSpace: number;
  totalSpace: number;
  itemCount: number;
  calendarEntryCount: number;
  lastModified: number;
  operationsPerMinute: number;
  averageItemSize: number;
}

interface StorageAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

interface PerformanceHistory {
  timestamp: number;
  usedSpace: number;
  itemCount: number;
  operationsPerMinute: number;
}

export function StorageMonitor({
  refreshInterval = 5000,
  onAlert
}: Readonly<StorageMonitorProps>): ReactElement {
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [alerts, setAlerts] = useState<StorageAlert[]>([]);
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const collectStorageMetrics = useCallback((): StorageMetrics => {
    const defaultMetrics: StorageMetrics = {
      usedSpace: 0,
      totalSpace: 5 * 1024 * 1024,
      itemCount: 0,
      calendarEntryCount: 0,
      lastModified: Date.now(),
      operationsPerMinute: 0,
      averageItemSize: 0
    };

    try {
      // Calculate used space
      let usedSpace = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            usedSpace += key.length + value.length;
          }
        }
      }

      // Get ATP item counts
      let itemCount = 0;
      let calendarEntryCount = 0;
      try {
        const items = JSON.parse(localStorage.getItem('atp-items') || '[]');
        const calendar = JSON.parse(localStorage.getItem('atp-calendar') || '[]');
        itemCount = Array.isArray(items) ? items.length : 0;
        calendarEntryCount = Array.isArray(calendar) ? calendar.length : 0;
      } catch {
        // Keep defaults if parsing fails
      }

      // Calculate other metrics
      const operationsPerMinute = history.length > 1
        ? Math.abs(itemCount - (history[history.length - 1]?.itemCount || 0)) * 60 / (refreshInterval / 1000)
        : 0;

      const averageItemSize = itemCount > 0 ? usedSpace / itemCount : 0;

      return {
        ...defaultMetrics,
        usedSpace,
        itemCount,
        calendarEntryCount,
        operationsPerMinute,
        averageItemSize,
        lastModified: Date.now()
      };
    } catch (error) {
      console.error('Error collecting storage metrics:', error);
      return defaultMetrics;
    }
  }, [history, refreshInterval]);

  useEffect(() => {
    if (!isMonitoring) return;

    const updateMetrics = (): void => {
      const newMetrics = collectStorageMetrics();
      setMetrics(newMetrics);
      setLastUpdate(new Date());

      // Update history
      const historyEntry: PerformanceHistory = {
        timestamp: Date.now(),
        usedSpace: newMetrics.usedSpace,
        itemCount: newMetrics.itemCount,
        operationsPerMinute: newMetrics.operationsPerMinute
      };

      setHistory(prev => {
        const updated = [...prev, historyEntry];
        // Keep only last 20 entries (for performance)
        return updated.slice(-20);
      });

      // Check for alerts
      const newAlerts = checkForAlerts(newMetrics);
      if (newAlerts.length > 0) {
        setAlerts(prev => {
          // Add new alerts and keep only last 10
          const combined = [...prev, ...newAlerts];
          return combined.slice(-10);
        });

        // Notify parent component
        newAlerts.forEach(alert => onAlert?.(alert));
      }
    };

    // Initial update
    updateMetrics();

    // Set up interval
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, onAlert, collectStorageMetrics]);

  const checkForAlerts = (metrics: StorageMetrics): StorageAlert[] => {
    const alerts: StorageAlert[] = [];
    const usagePercent = (metrics.usedSpace / metrics.totalSpace) * 100;

    // Storage usage alerts
    if (usagePercent > 90) {
      alerts.push({
        type: 'error',
        message: 'Storage usage critical - over 90% full',
        metric: 'storage',
        value: usagePercent,
        threshold: 90
      });
    } else if (usagePercent > 75) {
      alerts.push({
        type: 'warning',
        message: 'Storage usage high - over 75% full',
        metric: 'storage',
        value: usagePercent,
        threshold: 75
      });
    }

    // Item count alerts
    if (metrics.itemCount > 1000) {
      alerts.push({
        type: 'warning',
        message: 'High item count may affect performance',
        metric: 'itemCount',
        value: metrics.itemCount,
        threshold: 1000
      });
    }

    // Performance alerts
    if (metrics.operationsPerMinute > 100) {
      alerts.push({
        type: 'info',
        message: 'High activity detected',
        metric: 'operationsPerMinute',
        value: metrics.operationsPerMinute,
        threshold: 100
      });
    }

    return alerts;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (percent: number): 'success' | 'warning' | 'error' => {
    if (percent > 90) return 'error';
    if (percent > 75) return 'warning';
    return 'success';
  };

  const getTrendIcon = (current: number, previous: number): ReactElement => {
    if (current > previous) return <TrendingUp color="error" fontSize="small" />;
    if (current < previous) return <TrendingDown color="success" fontSize="small" />;
    return <Timeline color="action" fontSize="small" />;
  };

  if (!metrics) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <LinearProgress />
      </Box>
    );
  }

  const usagePercent = (metrics.usedSpace / metrics.totalSpace) * 100;
  const previousMetrics = history[history.length - 2];

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          <Memory sx={{ verticalAlign: 'middle', mr: 1 }} />
          Storage Monitor
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={isMonitoring}
                onChange={(e) => setIsMonitoring(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
          />
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={() => setLastUpdate(new Date())}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {lastUpdate && (
        <Typography variant="caption" color="textSecondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      )}

      {/* Storage Usage */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <Storage sx={{ verticalAlign: 'middle', mr: 1 }} />
            Storage Usage
          </Typography>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                {formatBytes(metrics.usedSpace)} / {formatBytes(metrics.totalSpace)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {usagePercent.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={usagePercent}
              color={getUsageColor(usagePercent)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="textSecondary">Items</Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2">{metrics.itemCount}</Typography>
                {previousMetrics && getTrendIcon(metrics.itemCount, previousMetrics.itemCount)}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Calendar</Typography>
              <Typography variant="body2">{metrics.calendarEntryCount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Avg Item Size</Typography>
              <Typography variant="body2">{formatBytes(metrics.averageItemSize)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <Speed sx={{ verticalAlign: 'middle', mr: 1 }} />
            Performance
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <Timeline />
              </ListItemIcon>
              <ListItemText
                primary="Operations/minute"
                secondary={metrics.operationsPerMinute.toFixed(1)}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Memory />
              </ListItemIcon>
              <ListItemText
                primary="Memory efficiency"
                secondary={`${((metrics.itemCount / (metrics.usedSpace || 1)) * 1000).toFixed(2)} items/KB`}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Active Alerts
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {alerts.slice(-3).map((alert, index) => (
                <Alert
                  key={`alert-${alert.message}-${index}`}
                  severity={alert.type}
                  action={
                    <Chip
                      size="small"
                      label={alert.metric}
                      variant="outlined"
                    />
                  }
                >
                  {alert.message}
                  {alert.value && alert.threshold && (
                    <Typography variant="caption" display="block">
                      Current: {alert.value.toFixed(1)} | Threshold: {alert.threshold}
                    </Typography>
                  )}
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                // Clear alerts
                setAlerts([]);
              }}
            >
              Clear Alerts
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                // Reset history
                setHistory([]);
              }}
            >
              Reset History
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => {
                if (confirm('This will clear all storage data. Continue?')) {
                  localStorage.clear();
                  setMetrics(collectStorageMetrics());
                }
              }}
            >
              Clear Storage
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
