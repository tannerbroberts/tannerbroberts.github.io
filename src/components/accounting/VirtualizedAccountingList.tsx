import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Typography } from '@mui/material';
import { ItemInstance } from '../../functions/utils/item/index';
import AccountingInstanceCard from './AccountingInstanceCard';

interface VirtualizedAccountingListProps {
  readonly instances: ItemInstance[];
  readonly height: number;
  readonly itemHeight?: number;
}

interface InstanceItemProps {
  readonly index: number;
  readonly style: React.CSSProperties;
  readonly data: ItemInstance[];
}

const InstanceItem = React.memo<InstanceItemProps>(({ index, style, data }) => (
  <div style={style}>
    <AccountingInstanceCard instance={data[index]} />
  </div>
));

InstanceItem.displayName = 'InstanceItem';

export default function VirtualizedAccountingList({
  instances,
  height,
  itemHeight = 200
}: VirtualizedAccountingListProps) {
  const getItemSize = useCallback(() => itemHeight, [itemHeight]);

  if (instances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No instances to display
        </Typography>
      </Box>
    );
  }

  return (
    <List
      height={height}
      itemCount={instances.length}
      itemSize={getItemSize}
      itemData={instances}
      overscanCount={5}
    >
      {InstanceItem}
    </List>
  );
}
