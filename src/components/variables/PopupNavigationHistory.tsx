import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Home
} from '@mui/icons-material';
import { UseVariablePopupNavigationReturn } from '../../hooks/useVariablePopupNavigation';

export interface PopupNavigationHistoryProps {
  navigation: UseVariablePopupNavigationReturn;
  showBreadcrumbs?: boolean;
  maxBreadcrumbs?: number;
  compact?: boolean;
}

export default function PopupNavigationHistory({
  navigation,
  showBreadcrumbs = true,
  maxBreadcrumbs = 4,
  compact = false
}: Readonly<PopupNavigationHistoryProps>) {
  const theme = useTheme();
  const {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    getNavigationPath,
    history,
    historyIndex,
    clearHistory
  } = navigation;

  const navigationPath = getNavigationPath();

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (event.altKey && canGoBack) {
            event.preventDefault();
            goBack();
          }
          break;
        case 'ArrowRight':
          if (event.altKey && canGoForward) {
            event.preventDefault();
            goForward();
          }
          break;
        case 'Home':
          if (event.ctrlKey && history.length > 0) {
            event.preventDefault();
            // Navigate to first item in history
            // This would need to be implemented by parent component
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoForward, goBack, goForward, history.length]);

  // Create breadcrumb items with truncation
  const createBreadcrumbs = () => {
    if (!showBreadcrumbs || navigationPath.length === 0) return null;

    let displayPath = navigationPath;

    // Truncate if too many items
    if (navigationPath.length > maxBreadcrumbs) {
      displayPath = [
        ...navigationPath.slice(0, 1), // First item
        '...',
        ...navigationPath.slice(-maxBreadcrumbs + 2) // Last items
      ];
    }

    return displayPath.map((item, index) => {
      const isLast = index === displayPath.length - 1;
      const isEllipsis = item === '...';

      if (isEllipsis) {
        return (
          <Typography key="ellipsis" color="text.secondary" variant="body2">
            ...
          </Typography>
        );
      }

      if (isLast) {
        return (
          <Typography key={`current-${item}`} color="text.primary" variant="body2" sx={{ fontWeight: 'medium' }}>
            {item}
          </Typography>
        );
      }

      return (
        <Typography key={`nav-${item}-${index}`} color="text.secondary" variant="body2">
          {item}
        </Typography>
      );
    });
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Go back (Alt + ←)">
          <span>
            <IconButton
              size="small"
              onClick={goBack}
              disabled={!canGoBack}
              sx={{ p: 0.5 }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Go forward (Alt + →)">
          <span>
            <IconButton
              size="small"
              onClick={goForward}
              disabled={!canGoForward}
              sx={{ p: 0.5 }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {navigationPath.length > 1 && (
          <Chip
            size="small"
            label={`${historyIndex + 1}/${history.length}`}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.75rem' }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Navigation Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Go back (Alt + ←)">
          <span>
            <IconButton
              size="small"
              onClick={goBack}
              disabled={!canGoBack}
              color="primary"
            >
              <ArrowBack />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Go forward (Alt + →)">
          <span>
            <IconButton
              size="small"
              onClick={goForward}
              disabled={!canGoForward}
              color="primary"
            >
              <ArrowForward />
            </IconButton>
          </span>
        </Tooltip>

        {history.length > 0 && (
          <Tooltip title="Clear navigation history">
            <IconButton
              size="small"
              onClick={clearHistory}
              color="secondary"
            >
              <Home />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Position indicator */}
        {history.length > 1 && (
          <Chip
            size="small"
            label={`${historyIndex + 1} of ${history.length}`}
            variant="outlined"
            color="primary"
          />
        )}
      </Box>

      {/* Breadcrumbs */}
      {showBreadcrumbs && navigationPath.length > 1 && (
        <Box sx={{
          pl: 1,
          borderLeft: `2px solid ${theme.palette.divider}`,
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <Breadcrumbs
            separator="›"
            maxItems={maxBreadcrumbs}
            sx={{
              fontSize: '0.875rem',
              '& .MuiBreadcrumbs-separator': {
                margin: '0 4px'
              }
            }}
          >
            {createBreadcrumbs()}
          </Breadcrumbs>
        </Box>
      )}
    </Box>
  );
}
