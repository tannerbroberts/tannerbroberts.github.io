import {
  Box,
  Typography,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Timeline,
  Category,
  Functions
} from '@mui/icons-material';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';

export interface PopupFooterProps {
  variableDefinition?: VariableDefinition;
  usageCount?: number;
  relatedVariables?: string[];
  compact?: boolean;
  showKeyboardHints?: boolean;
}

export default function PopupFooter({
  variableDefinition,
  usageCount = 0,
  relatedVariables = [],
  compact = false,
  showKeyboardHints = true
}: Readonly<PopupFooterProps>) {
  const theme = useTheme();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (compact) {
    return (
      <Box
        sx={{
          p: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem'
        }}
      >
        {usageCount > 0 && (
          <Chip
            size="small"
            icon={<Functions />}
            label={`Used ${usageCount} times`}
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}

        {showKeyboardHints && (
          <Typography variant="caption" color="text.secondary">
            Alt+← Alt+→ to navigate • Esc to close
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Statistics Section */}
      {(usageCount > 0 || relatedVariables.length > 0) && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Usage Statistics
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {usageCount > 0 && (
              <Chip
                size="small"
                icon={<Functions />}
                label={`Used in ${usageCount} items`}
                variant="outlined"
                color="primary"
              />
            )}

            {relatedVariables.length > 0 && (
              <Chip
                size="small"
                icon={<Timeline />}
                label={`${relatedVariables.length} related variables`}
                variant="outlined"
                color="secondary"
              />
            )}

            {variableDefinition?.category && (
              <Chip
                size="small"
                icon={<Category />}
                label={variableDefinition.category}
                variant="outlined"
              />
            )}
          </Box>

          {/* Related Variables Preview */}
          {relatedVariables.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Related: {relatedVariables.slice(0, 3).join(', ')}
                {relatedVariables.length > 3 && ` (+${relatedVariables.length - 3} more)`}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Metadata Section */}
      {variableDefinition && (
        <>
          <Divider />
          <Box sx={{ p: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Metadata
              </Typography>

              {variableDefinition.id && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {variableDefinition.id}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatTimestamp(variableDefinition.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Updated
                </Typography>
                <Typography variant="body2">
                  {formatTimestamp(variableDefinition.updatedAt)}
                </Typography>
              </Box>

              {variableDefinition.unit && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Unit
                  </Typography>
                  <Typography variant="body2">
                    {variableDefinition.unit}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Keyboard Shortcuts */}
      {showKeyboardHints && (
        <>
          <Divider />
          <Box sx={{ p: 2, pt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Keyboard Shortcuts
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip size="small" label="Alt + ←" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                <Typography variant="caption" color="text.secondary">Go back</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip size="small" label="Alt + →" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                <Typography variant="caption" color="text.secondary">Go forward</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip size="small" label="Esc" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                <Typography variant="caption" color="text.secondary">Close popup</Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
