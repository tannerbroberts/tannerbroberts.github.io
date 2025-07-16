import React from 'react';
import { Item } from '../functions/utils/item';

interface TaskBreadcrumbsProps {
  readonly chain: Item[];
  readonly currentItemId: string;
  readonly onItemClick: (itemId: string) => void;
}

export default function TaskBreadcrumbs({ chain, currentItemId, onItemClick }: TaskBreadcrumbsProps) {
  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(itemId);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      fontSize: '14px',
      color: '#666'
    }}>
      {chain.map((item, index) => (
        <React.Fragment key={item.id}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: item.id === currentItemId ? 'bold' : 'normal',
              color: item.id === currentItemId ? '#000' : '#666',
              fontSize: '14px',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onClick={() => handleItemClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
          >
            {item.name}
          </button>
          {index < chain.length - 1 && (
            <span style={{ margin: '0 4px' }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
