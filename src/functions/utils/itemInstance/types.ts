import { v4 as uuid } from "uuid";

export interface ItemInstance {
  readonly id: string;
  readonly itemId: string;
  readonly calendarEntryId: string;
  readonly scheduledStartTime: number;
  readonly actualStartTime?: number;
  readonly completedAt?: number;
  readonly isComplete: boolean;
  readonly executionDetails: InstanceExecutionDetails;
  readonly accountingStatus?: 'success' | 'canceled' | 'partial';
  readonly accountedAt?: number; // timestamp when accounting action taken
  readonly perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>; // itemId -> status
}

export interface InstanceExecutionDetails {
  readonly checklistStartTimes?: Record<string, number>;
  readonly variableState?: Record<string, number>;
  readonly notes?: string;
  readonly interruptionCount?: number;
}

export interface ItemInstanceJSON {
  id: string;
  itemId: string;
  calendarEntryId: string;
  scheduledStartTime: number;
  actualStartTime?: number;
  completedAt?: number;
  isComplete: boolean;
  executionDetails: InstanceExecutionDetails;
  accountingStatus?: 'success' | 'canceled' | 'partial';
  accountedAt?: number;
  perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>;
}

export class ItemInstanceImpl implements ItemInstance {
  readonly id: string;
  readonly itemId: string;
  readonly calendarEntryId: string;
  readonly scheduledStartTime: number;
  readonly actualStartTime?: number;
  readonly completedAt?: number;
  readonly isComplete: boolean;
  readonly executionDetails: InstanceExecutionDetails;
  readonly accountingStatus?: 'success' | 'canceled' | 'partial';
  readonly accountedAt?: number;
  readonly perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>;

  constructor(data: {
    id?: string;
    itemId: string;
    calendarEntryId: string;
    scheduledStartTime: number;
    actualStartTime?: number;
    completedAt?: number;
    isComplete?: boolean;
    executionDetails?: Partial<InstanceExecutionDetails>;
  accountingStatus?: 'success' | 'canceled' | 'partial';
  accountedAt?: number;
  perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>;
  }) {
    this.id = data.id || uuid();
    this.itemId = data.itemId;
    this.calendarEntryId = data.calendarEntryId;
    this.scheduledStartTime = data.scheduledStartTime;
    this.actualStartTime = data.actualStartTime;
    this.completedAt = data.completedAt;
    this.isComplete = data.isComplete || false; // DEFAULT TO INCOMPLETE - never auto-complete
    this.executionDetails = {
      checklistStartTimes: {},
      variableState: {},
      notes: "",
      interruptionCount: 0,
      ...data.executionDetails
    };
  this.accountingStatus = data.accountingStatus;
  this.accountedAt = data.accountedAt;
  this.perItemAccounting = data.perItemAccounting || {};
  }

  toJSON(): ItemInstanceJSON {
    return {
      id: this.id,
      itemId: this.itemId,
      calendarEntryId: this.calendarEntryId,
      scheduledStartTime: this.scheduledStartTime,
      actualStartTime: this.actualStartTime,
      completedAt: this.completedAt,
      isComplete: this.isComplete,
  executionDetails: this.executionDetails,
  accountingStatus: this.accountingStatus,
  accountedAt: this.accountedAt,
  perItemAccounting: this.perItemAccounting
    };
  }

  static fromJSON(json: ItemInstanceJSON): ItemInstanceImpl {
    return new ItemInstanceImpl(json);
  }

  // Immutable update methods
  markStarted(startTime: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      actualStartTime: startTime,
      executionDetails: {
        ...this.executionDetails,
        interruptionCount: (this.executionDetails.interruptionCount || 0) + 1
      }
    });
  }

  markCompleted(completedAt: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      completedAt,
      isComplete: true
    });
  }

  updateExecutionDetails(details: Partial<InstanceExecutionDetails>): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      executionDetails: {
        ...this.executionDetails,
        ...details
      }
    });
  }

  // Mark instance accounting outcome (success, canceled, partial)
  markAccounted(status: 'success' | 'canceled' | 'partial', time: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      accountingStatus: status,
      accountedAt: time
    });
  }

  // Mark accounting for a specific item id (one layer unwrapping when partial)
  markItemAccounting(itemId: string, status: 'success' | 'canceled' | 'partial', time: number = Date.now()): ItemInstanceImpl {
    const perItemAccounting = { ...(this.perItemAccounting || {}), [itemId]: status };
    const rootStatusUpdate = (itemId === this.itemId && (status === 'success' || status === 'canceled'))
      ? { accountingStatus: status, accountedAt: time }
      : { accountingStatus: this.accountingStatus, accountedAt: this.accountedAt };
    return new ItemInstanceImpl({
      ...this,
      ...rootStatusUpdate,
      perItemAccounting
    });
  }
}
