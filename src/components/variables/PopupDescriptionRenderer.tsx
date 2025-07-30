import { useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';
import { formatVariableLinksAsHtml } from '../../functions/utils/variable/linkParser';

export interface PopupDescriptionRendererProps {
  description: string | undefined;
  variableDefinitions: Map<string, VariableDefinition>;
  onVariableClick?: (definitionId: string, variableName: string) => void;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  searchTerm?: string;
}

export default function PopupDescriptionRenderer({
  description,
  variableDefinitions,
  onVariableClick,
  loading = false,
  error = null,
  compact = false,
  searchTerm
}: Readonly<PopupDescriptionRendererProps>) {

  // Process description with formatting and link parsing
  const processedHtml = useMemo(() => {
    if (!description?.trim()) return '';

    let processedText = description;

    // Apply search highlighting first (before other formatting)
    if (searchTerm?.trim()) {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, '<mark>$1</mark>');
    }

    // Apply markdown-like formatting
    processedText = processedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    // Format variable links for popup navigation
    processedText = formatVariableLinksAsHtml(
      processedText,
      variableDefinitions,
      (definitionId) => {
        // Find variable name from definition
        const definition = variableDefinitions.get(definitionId);
        if (definition && onVariableClick) {
          onVariableClick(definitionId, definition.name);
        }
      }
    );

    // Convert newlines to br tags and handle bullet points
    const textLines = processedText.split('\n');
    const processedLines = textLines.map(line => {
      if (line.trim().startsWith('- ')) {
        return `<li>${line.substring(2)}</li>`;
      }
      return line;
    });

    // Wrap consecutive li elements in ul
    let inList = false;
    const finalLines: string[] = [];

    processedLines.forEach(line => {
      if (line.startsWith('<li>')) {
        if (!inList) {
          finalLines.push('<ul>');
          inList = true;
        }
        finalLines.push(line);
      } else {
        if (inList) {
          finalLines.push('</ul>');
          inList = false;
        }
        finalLines.push(line);
      }
    });

    if (inList) {
      finalLines.push('</ul>');
    }

    return finalLines.join('<br>');
  }, [description, searchTerm, variableDefinitions, onVariableClick]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: compact ? 1 : 2 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="90%" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading description...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: compact ? 1 : 2 }}>
        <Alert severity="error" sx={{ '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty description state
  if (!description?.trim()) {
    return (
      <Box sx={{ p: compact ? 1 : 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            textAlign: 'center',
            py: 2
          }}
        >
          No description available for this variable.
        </Typography>
      </Box>
    );
  }

  // Main description display
  return (
    <Box
      sx={{
        p: compact ? 1 : 2,
        maxHeight: compact ? '200px' : '400px',
        overflow: 'auto',
        // Smooth scrolling
        scrollBehavior: 'smooth',
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 3,
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.6,
          // Styled HTML content
          '& mark': {
            backgroundColor: 'yellow',
            padding: '1px 2px',
            borderRadius: '2px'
          },
          '& strong': {
            fontWeight: 600
          },
          '& em': {
            fontStyle: 'italic'
          },
          '& ul': {
            margin: '8px 0',
            paddingLeft: '20px'
          },
          '& li': {
            marginBottom: '4px'
          },
          // Variable link styling
          '& .variable-link': {
            color: 'primary.main',
            textDecoration: 'none',
            cursor: 'pointer',
            padding: '1px 4px',
            borderRadius: '3px',
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'scale(1.02)',
              transition: 'all 0.15s ease-in-out'
            }
          },
          // Error styling for invalid links
          '& .variable-link-error': {
            color: 'error.main',
            textDecoration: 'line-through',
            backgroundColor: 'error.light',
            cursor: 'not-allowed'
          }
        }}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </Box>
  );
}
