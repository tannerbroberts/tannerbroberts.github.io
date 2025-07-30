import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  Preview,
  Edit,
  Info,
  Link as LinkIcon
} from '@mui/icons-material';
import { useAppState } from '../../reducerContexts/App';
import { validateVariableLinks } from '../../functions/utils/variable/linkParser';
import LinkedDescription from './LinkedDescription';

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  error?: string;
  helperText?: string;
  showFormatting?: boolean;
  showPreview?: boolean;
}

const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 10;

export default function DescriptionEditor({
  value,
  onChange,
  placeholder = "Enter a description for this variable...",
  disabled = false,
  maxLength = MAX_DESCRIPTION_LENGTH,
  minLength = MIN_DESCRIPTION_LENGTH,
  error,
  helperText,
  showFormatting = true,
  showPreview = true
}: Readonly<DescriptionEditorProps>) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const { variableDefinitions } = useAppState();

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Real-time link validation
  const linkValidation = useMemo(() => {
    return validateVariableLinks(localValue, variableDefinitions);
  }, [localValue, variableDefinitions]);

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const handleTextFieldChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  }, [handleChange]);

  // Insert formatting at cursor position
  const insertFormatting = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[data-description-editor="true"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localValue.substring(start, end);
    const newText = localValue.substring(0, start) + before + selectedText + after + localValue.substring(end);

    handleChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [localValue, handleChange]);

  const handleBold = useCallback(() => {
    insertFormatting('**', '**');
  }, [insertFormatting]);

  const handleItalic = useCallback(() => {
    insertFormatting('_', '_');
  }, [insertFormatting]);

  const handleBulletList = useCallback(() => {
    insertFormatting('\n- ', '');
  }, [insertFormatting]);

  const handleInsertVariableLink = useCallback(() => {
    insertFormatting('[', ']');
  }, [insertFormatting]);

  // Render preview using LinkedDescription component
  const renderPreview = useCallback((text: string) => {
    if (!text.trim()) {
      return <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No description provided</Typography>;
    }

    return (
      <LinkedDescription
        description={text}
        variableDefinitions={variableDefinitions}
        showValidation={true}
        showExpandToggle={false}
        compact={false}
      />
    );
  }, [variableDefinitions]);

  const characterCount = localValue.length;
  const isOverLimit = characterCount > maxLength;
  const isUnderMinimum = characterCount < minLength && characterCount > 0;

  const getHelperText = () => {
    if (error) return error;
    if (isOverLimit) return `Description is too long (${characterCount}/${maxLength} characters)`;
    if (isUnderMinimum) return `Description should be at least ${minLength} characters`;
    return helperText;
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'error';
    if (isUnderMinimum) return 'warning.main';
    return 'text.secondary';
  };

  return (
    <Box>
      {/* Formatting Toolbar */}
      {showFormatting && !isPreviewMode && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <Tooltip title="Bold (**text**)">
            <IconButton size="small" onClick={handleBold} disabled={disabled}>
              <FormatBold />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic (_text_)">
            <IconButton size="small" onClick={handleItalic} disabled={disabled}>
              <FormatItalic />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={handleBulletList} disabled={disabled}>
              <FormatListBulleted />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Variable Link ([variable_name])">
            <IconButton size="small" onClick={handleInsertVariableLink} disabled={disabled}>
              <LinkIcon />
            </IconButton>
          </Tooltip>
          {showPreview && (
            <Tooltip title={isPreviewMode ? "Edit" : "Preview"}>
              <IconButton
                size="small"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                color={isPreviewMode ? "primary" : "default"}
              >
                {isPreviewMode ? <Edit /> : <Preview />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Help Text */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Info sx={{ fontSize: 16, mt: 0.5 }} />
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Write a clear description of what this variable represents. You can:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ margin: 0, paddingLeft: '20px' }}>
              <li>Use **bold** for emphasis</li>
              <li>Use _italic_ for secondary information</li>
              <li>Reference other variables with [variable_name]</li>
              <li>Use bullet points for lists</li>
            </Typography>
          </Box>
        </Box>
      </Alert>

      {/* Editor/Preview */}
      {isPreviewMode ? (
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            minHeight: 120,
            backgroundColor: 'background.paper'
          }}
        >
          {renderPreview(localValue)}
        </Box>
      ) : (
        <TextField
          multiline
          rows={6}
          fullWidth
          value={localValue}
          onChange={handleTextFieldChange}
          placeholder={placeholder}
          disabled={disabled}
          error={Boolean(error) || isOverLimit || isUnderMinimum}
          helperText={getHelperText()}
          slotProps={{
            htmlInput: {
              'data-description-editor': 'true',
              maxLength: maxLength + 100 // Allow slight overflow for better UX
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }
          }}
        />
      )}

      {/* Character Count and Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {localValue.includes('[') && (
            <Chip
              size="small"
              label="Contains cross-references"
              color="info"
              variant="outlined"
            />
          )}
          {localValue.includes('**') && (
            <Chip
              size="small"
              label="Contains formatting"
              color="secondary"
              variant="outlined"
            />
          )}
          {linkValidation.validLinks.length > 0 && (
            <Chip
              size="small"
              label={`${linkValidation.validLinks.length} valid link${linkValidation.validLinks.length === 1 ? '' : 's'}`}
              color="success"
              variant="outlined"
            />
          )}
          {linkValidation.brokenLinks.length > 0 && (
            <Chip
              size="small"
              label={`${linkValidation.brokenLinks.length} broken link${linkValidation.brokenLinks.length === 1 ? '' : 's'}`}
              color="error"
              variant="outlined"
            />
          )}
        </Box>
        <Typography
          variant="caption"
          color={getCharacterCountColor()}
        >
          {characterCount}/{maxLength} characters
        </Typography>
      </Box>
    </Box>
  );
}
