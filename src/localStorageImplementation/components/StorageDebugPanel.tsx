import { useState, useEffect, ReactElement } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  MenuItem
} from '@mui/material';
import {
  ExpandMore,
  Storage,
  BugReport,
  Speed,
  DataObject,
  Refresh,
  Delete,
  Download,
  Settings,
  Warning,
  CheckCircle,
  Error,
  Info,
  Memory,
  Timer
} from '@mui/icons-material';
import { devTools, HealthCheckResult, PerformanceReport, DataInspection } from '../devTools';

// Sample datasets for the debug panel
const SAMPLE_DATASETS = {
  TYPICAL: 'Typical Usage',
  HEAVY: 'Heavy Load',
  MINIMAL: 'Minimal Data',
  STRESS_TEST: 'Stress Test'
} as const;

interface StorageDebugPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultExpanded?: boolean;
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestResults {
  passed: number;
  failed: number;
  tests: TestResult[];
}

export function StorageDebugPanel({
  position = 'bottom-right',
  defaultExpanded = false
}: Readonly<StorageDebugPanelProps>): ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState(0);
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceReport | null>(null);
  const [storageData, setStorageData] = useState<DataInspection | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return <></>;
  }

  const loadData = async (): Promise<void> => {
    if (!devTools) return;

    try {
      const health = devTools.quickHealthCheck();
      const performance = devTools.getPerformanceReport();
      const storage = devTools.inspectCurrentData();

      setHealthData(health);
      setPerformanceData(performance);
      setStorageData(storage);
    } catch (error) {
      console.error('Failed to load debug data:', error);
    }
  };

  const handleRefresh = (): void => {
    setRefreshKey(prev => prev + 1);
  };

  const positionStyles = {
    position: 'fixed' as const,
    [position.includes('bottom') ? 'bottom' : 'top']: 16,
    [position.includes('right') ? 'right' : 'left']: 16,
    zIndex: 9999,
    maxWidth: 600,
    maxHeight: '80vh',
    overflow: 'auto'
  };

  return (
    <Box sx={positionStyles}>
      <Paper elevation={8} sx={{ backgroundColor: 'background.paper' }}>
        <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Storage color="primary" />
              <Typography variant="h6">Storage Debug Panel</Typography>
              <Chip label="DEV" size="small" color="warning" />
              {healthData && (
                <Chip
                  label={healthData.overallHealth.toUpperCase()}
                  size="small"
                  color={getHealthColor(healthData.overallHealth)}
                />
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Box display="flex" gap={1}>
                  {['Overview', 'Data', 'Performance', 'Tools'].map((tab, index) => (
                    <Button
                      key={tab}
                      variant={activeTab === index ? 'contained' : 'text'}
                      size="small"
                      onClick={() => setActiveTab(index)}
                    >
                      {tab}
                    </Button>
                  ))}
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    sx={{ ml: 'auto' }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && (
                <StorageOverviewSection
                  healthData={healthData}
                  storageData={storageData}
                />
              )}

              {activeTab === 1 && (
                <RawDataInspector
                  storageData={storageData}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 2 && (
                <PerformanceMonitor
                  enabled={monitoringEnabled}
                  onToggle={setMonitoringEnabled}
                  performanceData={performanceData}
                />
              )}

              {activeTab === 3 && (
                <DataManagementActions onRefresh={handleRefresh} />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}

function StorageOverviewSection({
  healthData,
  storageData
}: Readonly<{
  healthData: HealthCheckResult | null;
  storageData: DataInspection | null;
}>): ReactElement {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Health Status and Storage Stats in a row */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <Box flex={1} minWidth={280}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <BugReport sx={{ verticalAlign: 'middle', mr: 1 }} />
                Health Status
              </Typography>
              {healthData ? (
                <>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {getHealthIcon(healthData.overallHealth)}
                    <Typography variant="body2" color="textSecondary">
                      Overall: {healthData.overallHealth}
                    </Typography>
                  </Box>
                  {healthData.issues.length > 0 && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {healthData.issues.length} issue(s) found
                    </Alert>
                  )}
                  {healthData.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      {healthData.warnings.length} warning(s)
                    </Alert>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box flex={1} minWidth={280}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <DataObject sx={{ verticalAlign: 'middle', mr: 1 }} />
                Storage Stats
              </Typography>
              {storageData ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Items:</Typography>
                    <Typography variant="body2">{storageData.itemCount}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Calendar:</Typography>
                    <Typography variant="body2">{storageData.calendarEntryCount}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Size:</Typography>
                    <Typography variant="body2">{(storageData.storageSize / 1024).toFixed(1)} KB</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Modified:</Typography>
                    <Typography variant="body2">
                      {new Date(storageData.lastModified).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

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
              onClick={() => devTools?.quickHealthCheck()}
            >
              Run Health Check
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => devTools?.resetToSampleData('TYPICAL')}
            >
              Load Sample Data
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => devTools?.backupCurrentData()}
            >
              Backup Data
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function RawDataInspector({
  storageData,
  onRefresh
}: Readonly<{
  storageData: DataInspection | null;
  onRefresh: () => void;
}>): ReactElement {
  const [selectedDataset, setSelectedDataset] = useState<string>('TYPICAL');

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">
        Data Inspector
      </Typography>

      {/* Sample Data Loader */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Load Sample Data
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              select
              size="small"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {Object.entries(SAMPLE_DATASETS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                devTools?.resetToSampleData(selectedDataset as keyof typeof SAMPLE_DATASETS);
                onRefresh();
              }}
            >
              Load Dataset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Current Data Summary */}
      {storageData && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Current Data Summary
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex={1} minWidth={200}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Total Items"
                      secondary={storageData.itemCount}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Basic Items"
                      secondary={storageData.summary.basicItems}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="SubCalendar Items"
                      secondary={storageData.summary.subCalendarItems}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="CheckList Items"
                      secondary={storageData.summary.checkListItems}
                    />
                  </ListItem>
                </List>
              </Box>
              <Box flex={1} minWidth={200}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Calendar Entries"
                      secondary={storageData.calendarEntryCount}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Storage Size"
                      secondary={`${(storageData.storageSize / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Orphaned Items"
                      secondary={storageData.summary.orphanedItems}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Data Integrity"
                      secondary={
                        <Box display="flex" gap={1}>
                          {storageData.dataIntegrity.itemsValid ?
                            <CheckCircle color="success" fontSize="small" /> :
                            <Error color="error" fontSize="small" />
                          }
                          Items Valid
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function PerformanceMonitor({
  enabled,
  onToggle,
  performanceData
}: Readonly<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  performanceData: PerformanceReport | null;
}>): ReactElement {
  const handleToggleMonitoring = (): void => {
    if (enabled) {
      devTools?.stopPerformanceMonitoring();
    } else {
      devTools?.startPerformanceMonitoring();
    }
    onToggle(!enabled);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Performance Monitor</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={handleToggleMonitoring}
            />
          }
          label="Enable Monitoring"
        />
      </Box>

      {performanceData && (
        <Box display="flex" gap={2} flexWrap="wrap">
          {/* Performance Metrics */}
          <Box flex={1} minWidth={280}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <Speed sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Current Metrics
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Timer /></ListItemIcon>
                    <ListItemText
                      primary="Average Latency"
                      secondary={`${performanceData.averageLatency.toFixed(2)}ms`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Speed /></ListItemIcon>
                    <ListItemText
                      primary="Operations/sec"
                      secondary={performanceData.operationsPerSecond.toFixed(1)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Memory /></ListItemIcon>
                    <ListItemText
                      primary="Memory Usage"
                      secondary={`${(performanceData.memoryUsage / 1024 / 1024).toFixed(1)} MB`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Performance History */}
          <Box flex={1} minWidth={280}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Operations
                </Typography>
                {performanceData.operations.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Operation</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceData.operations.slice(-5).map((op, index) => (
                          <TableRow key={`op-${op.timestamp}-${index}`}>
                            <TableCell>{op.name}</TableCell>
                            <TableCell>{op.duration.toFixed(2)}ms</TableCell>
                            <TableCell>{new Date(op.timestamp).toLocaleTimeString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No operations recorded
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function DataManagementActions({ onRefresh }: Readonly<{ onRefresh: () => void }>): ReactElement {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runStorageTests = async (): Promise<void> => {
    if (!devTools) return;

    setIsRunningTests(true);
    try {
      const results = devTools.runStorageTests();
      setTestResults(results);
    } catch (error) {
      console.error('Storage tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">
        Data Management
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Storage Tests */}
        <Box flex={1} minWidth={280}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Storage Tests
              </Typography>
              <Button
                variant="contained"
                onClick={runStorageTests}
                disabled={isRunningTests}
                sx={{ mb: 2 }}
              >
                {isRunningTests ? 'Running Tests...' : 'Run Storage Tests'}
              </Button>

              {isRunningTests && <LinearProgress />}

              {testResults && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Tests: {testResults.passed} passed, {testResults.failed} failed
                  </Typography>
                  <List dense>
                    {testResults.tests.map((test, index) => (
                      <ListItem key={`test-${test.name}-${index}`}>
                        <ListItemIcon>
                          {test.passed ?
                            <CheckCircle color="success" fontSize="small" /> :
                            <Error color="error" fontSize="small" />
                          }
                        </ListItemIcon>
                        <ListItemText
                          primary={test.name}
                          secondary={test.error || `${test.duration}ms`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Data Operations */}
        <Box flex={1} minWidth={280}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Data Operations
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => devTools?.backupCurrentData()}
                >
                  Export Data
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BugReport />}
                  onClick={() => devTools?.fullDiagnostic()}
                >
                  Full Diagnostic
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Settings />}
                  onClick={() => devTools?.optimizeStorage()}
                >
                  Optimize Storage
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<Delete />}
                  onClick={() => {
                    if (confirm('Clear all storage data?')) {
                      localStorage.clear();
                      onRefresh();
                    }
                  }}
                >
                  Clear Storage
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

// Helper functions
function getHealthColor(health: string): 'success' | 'warning' | 'error' | 'default' {
  switch (health) {
    case 'good': return 'success';
    case 'fair': return 'warning';
    case 'poor':
    case 'critical': return 'error';
    default: return 'default';
  }
}

function getHealthIcon(health: string): ReactElement {
  switch (health) {
    case 'good': return <CheckCircle color="success" fontSize="small" />;
    case 'fair': return <Warning color="warning" fontSize="small" />;
    case 'poor':
    case 'critical': return <Error color="error" fontSize="small" />;
    default: return <Info color="info" fontSize="small" />;
  }
}
