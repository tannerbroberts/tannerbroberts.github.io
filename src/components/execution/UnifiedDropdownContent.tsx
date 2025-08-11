import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Collapse,
  Chip,
  useTheme,
  Fade
} from '@mui/material';
import { Functions, Schedule, Info } from '@mui/icons-material';
import { ChildExecutionStatus } from './executionUtils';
import { formatDuration } from '../../functions/utils/formatTime';

/**
 * Interface for next child information from execution status
 */
interface NextChildInfo {
  readonly item: { readonly name: string };
  readonly timeUntilStart: number;
  readonly startTime: number;
}

/**
 * Props for the UnifiedDropdownContent component
 */
interface UnifiedDropdownContentProps {
  readonly isExpanded: boolean;
  readonly variableSummary: Record<string, number>;
  readonly hasVariables: boolean;
  readonly nextChild?: NextChildInfo | null;
  readonly gapPeriod?: boolean;
  readonly currentPhase?: string;
  readonly childExecutionStatus?: ChildExecutionStatus;
  readonly totalChildren?: number;
  readonly completedChildren?: number;
  readonly nextBasicDescendant?: { item: { name: string }; startTime: number; timeUntilStart: number } | null;
  readonly hasActiveBasicDescendant?: boolean;
}

/**
 * Unified dropdown content component that combines variable summary and task execution details
 * into a single, cohesive interface. This component provides a comprehensive view of both
 * resource information and upcoming task details.
 * 
 * @param props - Component props including expansion state and data to display
 * @returns React component
 */
function UnifiedDropdownContent({
  isExpanded,
  variableSummary,
  hasVariables,
  nextChild,
  gapPeriod = false,
  currentPhase,
  childExecutionStatus,
  totalChildren,
  completedChildren,
  nextBasicDescendant,
  hasActiveBasicDescendant
}: UnifiedDropdownContentProps): React.JSX.Element {
  const theme = useTheme();

  // Process variables for display
  const { variableCount, groupedVariables } = useMemo(() => {
    const variables = Object.entries(variableSummary).map(([name, quantity]) => ({
      name,
      quantity
    }));

    const variableCount = variables.length;

    // Group variables - for now all go in one category since we simplified
    const grouped: Record<string, typeof variables> = {
      'variables': variables
    };

    return { variableCount, groupedVariables: grouped };
  }, [variableSummary]);

  // Render a variable chip with appropriate styling and animations
  const renderVariableChip = (name: string, quantity: number) => {
    const sign = quantity >= 0 ? '+' : '';
    const label = `${sign}${quantity} ${name}`;

    return (
      <Chip
        key={name}
        label={label}
        size="small"
        variant="outlined"
        color={quantity >= 0 ? 'success' : 'error'}
        sx={{
          m: 0.25,
          fontSize: '0.75rem',
          height: 24,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[2]
          },
          '& .MuiChip-label': {
            fontWeight: 500
          }
        }}
      />
    );
  };

  // Get contextual guidance text based on execution status
  const getContextualGuidance = (): string => {
    if (!childExecutionStatus) return 'Monitor SubCalendar progress';

    const { activeChild, nextChild: nextChildFromStatus, gapPeriod: isInGap } = childExecutionStatus;

    if (activeChild) {
      return `Currently executing: ${activeChild.name}`;
    }

    if (nextChildFromStatus && nextChildFromStatus.timeUntilStart < 30000) {
      return `Prepare for: ${nextChildFromStatus.item.name} (starts soon)`;
    }

    if (nextChildFromStatus) {
      return `Next task: ${nextChildFromStatus.item.name}`;
    }

    if (isInGap) {
      return 'Monitor cooking progress during gap period';
    }

    return 'SubCalendar monitoring complete';
  };

  return (
    <Collapse
      in={isExpanded}
      timeout={{
        enter: 300,
        exit: 250
      }}
      easing={{
        enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0, 0.6, 1)'
      }}
    >
      <Fade
        in={isExpanded}
        timeout={{
          enter: 400,
          exit: 200
        }}
        easing={{
          enter: 'cubic-bezier(0.0, 0, 0.2, 1)',
          exit: 'cubic-bezier(0.4, 0, 1, 1)'
        }}
      >
        <Box
          component="section"
          aria-label="SubCalendar details and variable summary"
          sx={{
            mt: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            overflow: 'hidden',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[3]
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%'
            }}
          >
            {/* Variable Summary Section */}
            {hasVariables && (
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRight: {
                    xs: 'none',
                    md: `1px solid ${theme.palette.divider}`
                  },
                  borderBottom: {
                    xs: `1px solid ${theme.palette.divider}`,
                    md: 'none'
                  },
                  backgroundColor: {
                    xs: 'transparent',
                    md: theme.palette.grey[50]
                  }
                }}
              >
                {/* Variable Summary Header */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                  pb: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Functions color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                    Resource Summary
                  </Typography>
                  <Chip
                    label={variableCount}
                    size="small"
                    variant="filled"
                    color="primary"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      minWidth: 20
                    }}
                  />
                </Box>

                {/* Variable Categories */}
                {Object.entries(groupedVariables).map(([category, variables], categoryIndex) => (
                  <Box key={category} sx={{ mb: categoryIndex < Object.keys(groupedVariables).length - 1 ? 2 : 0 }}>
                    {Object.keys(groupedVariables).length > 1 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'block',
                          fontSize: '0.7rem'
                        }}
                      >
                        {category}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {variables.map(variable =>
                        renderVariableChip(variable.name, variable.quantity)
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Task Execution Details Section */}
            <Box
              sx={{
                flex: hasVariables ? 1 : 2,
                p: 2.5
              }}
            >
              {/* Task Details Header */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2.5,
                pb: 1,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Schedule color="info" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold" color="info.main">
                  Execution Details
                </Typography>
              </Box>

              {/* Next Task Information */}
              {nextChild && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: gapPeriod ? 'warning.50' : 'info.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: gapPeriod ? 'warning.200' : 'info.200',
                    mb: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[2]
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundColor: gapPeriod ? 'warning.main' : 'info.main',
                      opacity: 0.8
                    }
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color={gapPeriod ? 'warning.main' : 'info.main'}
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    {gapPeriod ? 'Gap Period' : 'Up Next'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {nextChild.item.name}
                  </Typography>
                  {nextChild.timeUntilStart > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      Time remaining: {formatDuration(nextChild.timeUntilStart)}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Children summary */}
              {typeof totalChildren === 'number' && (
                <Box sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Children
                  </Typography>
                  <Typography variant="body2">
                    {completedChildren ?? 0} of {totalChildren} complete
                  </Typography>
                </Box>
              )}

              {/* Next basic descendant info when none active */}
              {nextBasicDescendant && hasActiveBasicDescendant === false && (
                <Box sx={{
                  p: 2,
                  backgroundColor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.200',
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Next Basic Item
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {nextBasicDescendant.item.name}
                  </Typography>
                  {nextBasicDescendant.timeUntilStart > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Starts in {formatDuration(nextBasicDescendant.timeUntilStart)}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Contextual Guidance */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Info
                  color="action"
                  fontSize="small"
                  sx={{
                    mt: 0.1,
                    transition: 'color 0.2s ease-in-out'
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 'medium',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}
                  >
                    {getContextualGuidance()}
                  </Typography>
                  {currentPhase && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: 'block',
                        fontStyle: 'italic'
                      }}
                    >
                      Phase: {currentPhase}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Collapse>
  );
}

export default UnifiedDropdownContent;
