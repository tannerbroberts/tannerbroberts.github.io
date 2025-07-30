import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Chip,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { formatVariableLinksAsHtml, validateVariableLinks } from '../../functions/utils/variable/linkParser';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';

interface LinkedDescriptionProps {
  description: string;
  variableDefinitions: Map<string, VariableDefinition>;
  onVariableClick?: (definitionId: string) => void;
  maxLines?: number;
  showValidation?: boolean;
  showExpandToggle?: boolean;
  compact?: boolean;
  searchTerm?: string;
}

const DEFAULT_MAX_LINES = 3;

export default function LinkedDescription({
  description,
  variableDefinitions,
  onVariableClick,
  maxLines = DEFAULT_MAX_LINES,
  showValidation = true,
  showExpandToggle = true,
  compact = false,
  searchTerm
}: Readonly<LinkedDescriptionProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const toggleValidationDetails = useCallback(() => {
    setShowValidationDetails(!showValidationDetails);
  }, [showValidationDetails]);

  // Validate links and get metadata
  const linkValidation = useMemo(() => {
    return validateVariableLinks(description, variableDefinitions);
  }, [description, variableDefinitions]);

  // Process description with formatting and link parsing
  const processedHtml = useMemo(() => {
    if (!description.trim()) return '';

    let processedText = description;

    // Check if description needs truncation
    const lines = description.split('\n');
    const needsTruncation = lines.length > maxLines || description.length > 200;

    // Truncate if needed and not expanded
    if (needsTruncation && !isExpanded && showExpandToggle) {
      const truncatedLines = lines.slice(0, maxLines).join('\n');
      if (truncatedLines.length < description.length) {
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

    // Format variable links
    processedText = formatVariableLinksAsHtml(processedText, variableDefinitions, onVariableClick);

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

    return finalText;
  }, [description, variableDefinitions, onVariableClick, maxLines, isExpanded, showExpandToggle, searchTerm]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const variableId = target.getAttribute('data-variable-id');
    if (variableId && onVariableClick) {
      onVariableClick(variableId);
    }
  }, [onVariableClick]);

  // Check if description needs truncation
  const lines = description.split('\n');
  const needsTruncation = lines.length > maxLines || description.length > 200;

  // Get validation summary
  const hasValidLinks = linkValidation.validLinks.length > 0;
  const hasBrokenLinks = linkValidation.brokenLinks.length > 0;
  const totalLinks = hasValidLinks ? linkValidation.validLinks.length : 0;

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
        <Typography
          component="div"
          variant={compact ? "body2" : "body1"}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          onClick={handleClick}
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
            '& .variable-link.valid': {
              '&:hover': {
                backgroundColor: onVariableClick ? '#bbdefb' : undefined,
                transform: onVariableClick ? 'scale(1.05)' : undefined,
                transition: 'all 0.2s ease'
              }
            },
            '& .variable-link.broken': {
              '&:hover': {
                backgroundColor: '#ffcdd2'
              }
            },
            lineHeight: compact ? 1.4 : 1.6,
            cursor: onVariableClick ? 'default' : undefined
          }}
        />
      </Box>

      {/* Link validation status */}
      {showValidation && (hasValidLinks || hasBrokenLinks) && !compact && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {hasValidLinks && (
            <Tooltip title={`${totalLinks} valid variable link${totalLinks === 1 ? '' : 's'}`}>
              <Chip
                size="small"
                icon={<CheckCircle />}
                label={`${totalLinks} linked`}
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Tooltip>
          )}

          {hasBrokenLinks && (
            <Tooltip title={`${linkValidation.brokenLinks.length} broken link${linkValidation.brokenLinks.length === 1 ? '' : 's'}`}>
              <Chip
                size="small"
                icon={<Warning />}
                label={`${linkValidation.brokenLinks.length} broken`}
                color="error"
                variant="outlined"
                clickable
                onClick={toggleValidationDetails}
                sx={{ fontSize: '0.75rem' }}
              />
            </Tooltip>
          )}
        </Box>
      )}

      {/* Broken links details */}
      {hasBrokenLinks && showValidation && (
        <Collapse in={showValidationDetails}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              backgroundColor: 'error.light',
              border: '1px solid',
              borderColor: 'error.main'
            }}
          >
            <Typography variant="subtitle2" color="error.dark" sx={{ mb: 1 }}>
              Broken Variable Links:
            </Typography>
            {linkValidation.brokenLinks.map((brokenLink) => (
              <Box key={`${brokenLink.text}-${brokenLink.position.start}`} sx={{ mb: 1 }}>
                <Typography variant="body2" color="error.dark">
                  <strong>[{brokenLink.text}]</strong> - Variable not found
                </Typography>
                {brokenLink.suggestions.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Did you mean:
                    </Typography>
                    {brokenLink.suggestions.map((suggestion) => (
                      <Chip
                        key={`${brokenLink.text}-${suggestion}`}
                        size="small"
                        label={suggestion}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Paper>
        </Collapse>
      )}

      {/* Expand/Collapse toggle */}
      {needsTruncation && showExpandToggle && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={toggleExpanded}
            sx={{ p: 0.5 }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Typography
            variant="body2"
            color="primary"
            onClick={toggleExpanded}
            sx={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Typography>
        </Box>
      )}

      {/* Search indicator */}
      {searchTerm?.trim() && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Highlighting search: "{searchTerm}"
        </Typography>
      )}
    </Box>
  );
}
