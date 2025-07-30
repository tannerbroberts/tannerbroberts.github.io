import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Close,
  Edit,
  Visibility
} from '@mui/icons-material';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';
import PopupNavigationHistory from './PopupNavigationHistory';
import { UseVariablePopupNavigationReturn } from '../../hooks/useVariablePopupNavigation';

export interface PopupHeaderProps {
  variableName: string;
  variableDefinition?: VariableDefinition;
  navigation: UseVariablePopupNavigationReturn;
  onClose: () => void;
  onEdit?: (definitionId: string) => void;
  onViewDefinition?: (definitionId: string) => void;
  compact?: boolean;
}

export default function PopupHeader({
  variableName,
  variableDefinition,
  navigation,
  onClose,
  onEdit,
  onViewDefinition,
  compact = false
}: Readonly<PopupHeaderProps>) {
  const theme = useTheme();

  const handleEditClick = () => {
    if (variableDefinition && onEdit) {
      onEdit(variableDefinition.id);
    }
  };

  const handleViewDefinitionClick = () => {
    if (variableDefinition && onViewDefinition) {
      onViewDefinition(variableDefinition.id);
    }
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'ingredients':
        return 'primary';
      case 'equipment':
        return 'secondary';
      case 'skills':
        return 'success';
      case 'food':
        return 'warning';
      case 'consumables':
        return 'info';
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {variableName}
          </Typography>

          {variableDefinition?.category && (
            <Chip
              size="small"
              label={variableDefinition.category}
              color={getCategoryColor(variableDefinition.category)}
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 18 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PopupNavigationHistory
            navigation={navigation}
            compact={true}
            showBreadcrumbs={false}
          />

          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* Title Row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5
            }}
          >
            {variableName}
          </Typography>

          {/* Variable metadata */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {variableDefinition?.category && (
              <Chip
                size="small"
                label={variableDefinition.category}
                color={getCategoryColor(variableDefinition.category)}
                variant="filled"
              />
            )}

            {variableDefinition?.unit && (
              <Chip
                size="small"
                label={`Unit: ${variableDefinition.unit}`}
                variant="outlined"
              />
            )}

            {variableDefinition?.id && (
              <Chip
                size="small"
                label={`ID: ${variableDefinition.id.slice(0, 8)}...`}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          {variableDefinition && onEdit && (
            <Tooltip title="Edit variable">
              <IconButton size="small" onClick={handleEditClick} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {variableDefinition && onViewDefinition && (
            <Tooltip title="View definition">
              <IconButton size="small" onClick={handleViewDefinitionClick} color="secondary">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Close (Esc)">
            <IconButton size="small" onClick={onClose}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Navigation History */}
      <PopupNavigationHistory
        navigation={navigation}
        showBreadcrumbs={true}
        maxBreadcrumbs={3}
      />
    </Box>
  );
}
