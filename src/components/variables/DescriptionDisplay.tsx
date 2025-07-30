import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Search
} from '@mui/icons-material';

interface DescriptionDisplayProps {
  description: string;
  maxLines?: number;
  searchTerm?: string;
  onVariableClick?: (variableName: string) => void;
  showExpandToggle?: boolean;
  compact?: boolean;
}

const DEFAULT_MAX_LINES = 3;

export default function DescriptionDisplay({
  description,
  maxLines = DEFAULT_MAX_LINES,
  searchTerm,
  onVariableClick,
  showExpandToggle = true,
  compact = false
}: Readonly<DescriptionDisplayProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Check if description needs truncation
  const lines = description.split('\n');
  const needsTruncation = lines.length > maxLines || description.length > 200;

  const handleVariableClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const variableName = target.getAttribute('data-variable-name');
    if (variableName && onVariableClick) {
      onVariableClick(variableName);
    }
  }, [onVariableClick]);

  // Process description with formatting and search highlighting
  const processDescription = useCallback((text: string, shouldTruncate: boolean = false) => {
    if (!text.trim()) {
      return <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No description available</Typography>;
    }

    let processedText = text;

    // Truncate if needed and not expanded
    if (shouldTruncate && !isExpanded) {
      const truncatedLines = lines.slice(0, maxLines).join('\n');
      if (truncatedLines.length < text.length) {
        processedText = truncatedLines + '...';
      }
    }

    // Apply search highlighting first (before other formatting)
    if (searchTerm?.trim()) {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, '<mark>$1</mark>');
    }

    // Apply markdown-like formatting
    processedText = processedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    // Process variable references [variable_name]
    processedText = processedText.replace(/\[([^\]]+)\]/g, (_, variableName) => {
      const clickHandler = onVariableClick ? `data-variable-name="${variableName}"` : '';
      const clickable = onVariableClick ? 'cursor: pointer; text-decoration: underline;' : '';
      return `<span ${clickHandler} style="background-color: #e3f2fd; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875em; ${clickable}">${variableName}</span>`;
    });

    // Convert newlines to br tags and handle bullet points
    const textLines = processedText.split('\n');
    const processedLines = textLines.map(line => {
      if (line.trim().startsWith('- ')) {
        return `<li>${line.substring(2)}</li>`;
      }
      return line;
    });

    // Wrap consecutive li elements in ul
    const finalText = processedLines.join('<br>').replace(/(<li>.*?<\/li>(<br>)?)+/g, (match) => {
      const listItems = match.replace(/<br>/g, '');
      return `<ul style="margin: 8px 0; padding-left: 20px;">${listItems}</ul>`;
    });

    return (
      <Typography
        component="div"
        variant={compact ? "body2" : "body1"}
        dangerouslySetInnerHTML={{ __html: finalText }}
        onClick={handleVariableClick}
        sx={{
          '& mark': {
            backgroundColor: '#fff59d',
            padding: '1px 2px',
            borderRadius: '2px'
          },
          '& ul': {
            margin: '8px 0',
            paddingLeft: '20px',
            '& li': { margin: '2px 0' }
          },
          '& strong': { fontWeight: 'bold' },
          '& em': { fontStyle: 'italic' },
          '& span[data-variable-name]': {
            '&:hover': {
              backgroundColor: onVariableClick ? '#bbdefb' : undefined
            }
          },
          lineHeight: compact ? 1.4 : 1.6
        }}
      />
    );
  }, [searchTerm, onVariableClick, isExpanded, maxLines, compact, lines, handleVariableClick]);

  // Extract referenced variables for display
  const referencedVariables = React.useMemo(() => {
    const matches = description.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.slice(1, -1)))];
  }, [description]);

  if (!description.trim()) {
    return (
      <Typography
        color="text.secondary"
        sx={{ fontStyle: 'italic' }}
        variant={compact ? "body2" : "body1"}
      >
        No description available
      </Typography>
    );
  }

  return (
    <Box>
      {/* Main description content */}
      <Box sx={{ mb: 1 }}>
        {processDescription(description, needsTruncation && showExpandToggle)}
      </Box>

      {/* Cross-referenced variables */}
      {referencedVariables.length > 0 && !compact && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            References:
          </Typography>
          {referencedVariables.map((variable) => (
            <Chip
              key={variable}
              label={variable}
              size="small"
              variant="outlined"
              clickable={Boolean(onVariableClick)}
              onClick={() => onVariableClick?.(variable)}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      )}

      {/* Expand/Collapse toggle */}
      {needsTruncation && showExpandToggle && (
        <Button
          size="small"
          onClick={toggleExpanded}
          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
          sx={{ mt: 0.5 }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}

      {/* Search indicator */}
      {searchTerm?.trim() && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <Search sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Matches search: "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}
