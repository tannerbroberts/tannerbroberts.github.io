import { useCallback, useEffect, useState } from 'react';
import {
  Portal,
  Paper,
  Box,
  useTheme,
  Fade
} from '@mui/material';
import { useAppState } from '../../reducerContexts/App';
import { useVariableDescriptions } from '../../hooks/useVariableDescriptions';
import { usePopupPositioning } from '../../hooks/usePopupPositioning';
import { useVariablePopupNavigation } from '../../hooks/useVariablePopupNavigation';
import ClickAwayHandler from '../common/ClickAwayHandler';
import PopupHeader from './PopupHeader';
import PopupFooter from './PopupFooter';
import PopupDescriptionRenderer from './PopupDescriptionRenderer';

export interface VariableDescriptionPopupProps {
  open: boolean;
  variableDefinitionId: string;
  variableName: string;
  mousePosition?: { x: number; y: number };
  onClose: () => void;
  onEdit?: (definitionId: string) => void;
  onViewDefinition?: (definitionId: string) => void;
  compact?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export default function VariableDescriptionPopup({
  open,
  variableDefinitionId,
  variableName,
  mousePosition,
  onClose,
  onEdit,
  onViewDefinition,
  compact = false,
  maxWidth = 450,
  maxHeight = 500
}: Readonly<VariableDescriptionPopupProps>) {
  const theme = useTheme();
  const { variableDefinitions } = useAppState();
  const { getDescription } = useVariableDescriptions();
  const { calculatePosition, clearPosition } = usePopupPositioning();
  const navigation = useVariablePopupNavigation({ maxHistoryLength: 20 });

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current variable definition and description
  const variableDefinition = variableDefinitions.get(variableDefinitionId);
  const description = variableDefinition ? getDescription(variableDefinitionId) : undefined;

  // Handle popup positioning
  useEffect(() => {
    if (open && mousePosition) {
      const mockEvent = {
        clientX: mousePosition.x,
        clientY: mousePosition.y,
        target: document.body
      } as unknown as MouseEvent;

      const calculatedPosition = calculatePosition(mockEvent, {
        popupWidth: maxWidth,
        popupHeight: maxHeight
      });

      setPosition({ x: calculatedPosition.x, y: calculatedPosition.y });
    } else if (!open) {
      setPosition(null);
      clearPosition();
    }
  }, [open, mousePosition, calculatePosition, clearPosition, maxWidth, maxHeight]);

  // Initialize navigation with current variable
  useEffect(() => {
    if (open && variableDefinitionId && variableName) {
      navigation.navigateToVariable(variableDefinitionId, variableName);
    }
  }, [open, variableDefinitionId, variableName, navigation]);

  // Handle variable navigation within popup
  const handleVariableClick = useCallback((definitionId: string, varName: string) => {
    setLoading(true);
    setError(null);

    try {
      const definition = variableDefinitions.get(definitionId);
      if (!definition) {
        setError(`Variable "${varName}" not found`);
        setLoading(false);
        return;
      }

      // Navigate to the new variable
      navigation.navigateToVariable(definitionId, varName);
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load variable "${varName}": ${errorMessage}`);
      setLoading(false);
    }
  }, [variableDefinitions, navigation]);

  // Handle popup close
  const handleClose = useCallback(() => {
    setPosition(null);
    setError(null);
    navigation.clearHistory();
    onClose();
  }, [onClose, navigation]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleClose]);

  // Get current variable info from navigation
  const currentVariable = navigation.currentVariable;
  const currentDefinition = currentVariable
    ? variableDefinitions.get(currentVariable.definitionId)
    : variableDefinition;
  const currentDescription = currentVariable
    ? getDescription(currentVariable.definitionId)
    : description;
  const currentVariableName = currentVariable?.variableName || variableName;

  if (!open || !position) {
    return null;
  }

  const popupContent = (
    <Fade in={open} timeout={200}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: maxWidth,
          maxHeight: maxHeight,
          zIndex: theme.zIndex.modal + 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        {/* Header */}
        <PopupHeader
          variableName={currentVariableName}
          variableDefinition={currentDefinition}
          navigation={navigation}
          onClose={handleClose}
          onEdit={onEdit}
          onViewDefinition={onViewDefinition}
          compact={compact}
        />

        {/* Description Content */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <PopupDescriptionRenderer
            description={currentDescription?.content}
            variableDefinitions={variableDefinitions}
            onVariableClick={handleVariableClick}
            loading={loading}
            error={error}
            compact={compact}
          />
        </Box>

        {/* Footer */}
        <PopupFooter
          variableDefinition={currentDefinition}
          usageCount={0} // TODO: Calculate actual usage count
          relatedVariables={[]} // TODO: Get related variables
          compact={compact}
          showKeyboardHints={!compact}
        />
      </Paper>
    </Fade>
  );

  return (
    <Portal>
      <ClickAwayHandler onClickAway={handleClose} enabled={open}>
        {popupContent}
      </ClickAwayHandler>
    </Portal>
  );
}
