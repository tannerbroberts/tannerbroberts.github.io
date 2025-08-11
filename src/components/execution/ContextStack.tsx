import { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Item, SubCalendarItem, CheckListItem } from '../../functions/utils/item/index';
import { getTaskProgress } from '../../functions/utils/item/utils';

interface ContextStackProps {
  readonly taskChain: Item[]; // [root ... leaf]
  readonly currentTime: number;
  readonly rootStartTime: number;
}

function computeAbsoluteStarts(taskChain: Item[], rootStartTime: number): number[] {
  const starts: number[] = [];
  let acc = rootStartTime;
  starts.push(acc);
  for (let i = 1; i < taskChain.length; i++) {
    const parent = taskChain[i - 1];
    const child = taskChain[i];
    if (parent instanceof SubCalendarItem) {
      const ref = parent.children.find(c => c.id === child.id);
      acc = acc + (ref?.start ?? 0);
    } else if (parent instanceof CheckListItem) {
      // Checklist children share parent start (no change)
    }
    starts.push(acc);
  }
  return starts;
}

const Row = ({
  name,
  progress,
  accent,
  isLeaf
}: { name: string; progress: number; accent: string; isLeaf?: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent, flexShrink: 0 }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant={isLeaf ? 'subtitle1' : 'body2'}
        sx={{ fontWeight: isLeaf ? 700 : 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={name}
      >
        {isLeaf ? 'Now · ' : ''}{name}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, progress))}
        sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
      />
    </Box>
  </Box>
);

export default function ContextStack({ taskChain, currentTime, rootStartTime }: ContextStackProps) {
  const starts = useMemo(() => computeAbsoluteStarts(taskChain, rootStartTime), [taskChain, rootStartTime]);

  const rows = useMemo(() => {
    return taskChain.map((it, idx) => {
      const start = starts[idx] ?? rootStartTime;
      let progress = 0;
      try {
        progress = getTaskProgress(it, currentTime, start);
      } catch {
        progress = 0;
      }
      const isLeaf = idx === taskChain.length - 1;
      const accent = isLeaf ? 'success.main' : 'primary.main';
      return { name: it.name, progress, isLeaf, accent };
    });
  }, [taskChain, starts, currentTime, rootStartTime]);

  if (taskChain.length <= 1) return null; // No need if there is no parent context

  return (
    <Box sx={{
      mb: 2,
      p: 1.5,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 0,
    }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>Context</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.map((r) => (
          <Row key={`${r.name}-${r.isLeaf ? 'leaf' : 'ctx'}`} name={r.name} progress={r.progress} accent={r.accent} isLeaf={r.isLeaf} />
        ))}
      </Box>
    </Box>
  );
}
