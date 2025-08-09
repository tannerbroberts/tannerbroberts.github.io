// Test file to verify components can be imported and basic functionality works
import React from 'react';
import { PrimaryBasicItemDisplay, PrimarySubCalendarItemDisplay } from './index';
import { BasicItem, SubCalendarItem } from '../../functions/utils/item/index';

// This file serves as a basic import test and type check
// It should not be included in the final build

const TestComponents: React.FC = () => {
  // Mock data for testing
  const mockBasicItem = new BasicItem({
    name: 'Test Basic Item',
    duration: 60000, // 1 minute
    priority: 1
  });

  const mockSubCalendarItem = new SubCalendarItem({
    name: 'Test SubCalendar Item',
    duration: 300000 // 5 minutes
  });

  const mockProps = {
    taskChain: [],
    currentTime: Date.now(),
    startTime: Date.now() - 30000, // Started 30 seconds ago
    isDeepest: true
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Primary Display Components Test</h2>

      <div>
        <h3>BasicItem Display</h3>
        <PrimaryBasicItemDisplay
          item={mockBasicItem}
          {...mockProps}
        />
      </div>

      <div>
        <h3>SubCalendarItem Display</h3>
        <PrimarySubCalendarItemDisplay
          item={mockSubCalendarItem}
          {...mockProps}
        />
      </div>

      {/* Placeholder area for additional component checks */}
    </div>
  );
};

export default TestComponents;
