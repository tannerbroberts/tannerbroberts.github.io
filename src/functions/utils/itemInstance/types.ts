import { v4 as uuid } from "uuid";

export type ItemInstanceStatus = 'pending' | 'complete' | 'partial' | 'canceled';

export interface ItemInstance {
  readonly id: string;
  readonly itemId: string;
  readonly calendarEntryId: string;
  readonly scheduledStartTime: number;
  readonly actualStartTime?: number;
  readonly completedAt?: number;
  readonly parentItemId?: string;
  readonly status: ItemInstanceStatus;
  readonly executionDetails: InstanceExecutionDetails;
  // Legacy / backward compatibility fields (may be undefined in new instances)
  readonly accountingStatus?: 'success' | 'canceled' | 'partial';
  readonly accountedAt?: number; // timestamp when accounting action taken
  readonly perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>; // itemId -> status
  // Derived for transitional compatibility (avoid using in new code directly)
  readonly isComplete?: boolean;
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
  parentItemId?: string;
  status?: ItemInstanceStatus; // optional for backward compatibility
  isComplete?: boolean; // legacy
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
  private _completedAt?: number;
  get completedAt(): number | undefined { return this._completedAt; }
  readonly parentItemId?: string;
  readonly status: ItemInstanceStatus;
  readonly executionDetails: InstanceExecutionDetails;
  readonly accountingStatus?: 'success' | 'canceled' | 'partial';
  readonly accountedAt?: number;
  readonly perItemAccounting?: Record<string, 'success' | 'canceled' | 'partial'>;
  readonly isComplete?: boolean; // transitional derived field

  constructor(data: {
    id?: string;
    itemId: string;
    calendarEntryId: string;
    scheduledStartTime: number;
    actualStartTime?: number;
    completedAt?: number;
    parentItemId?: string;
    status?: ItemInstanceStatus;
    isComplete?: boolean; // legacy
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
  this._completedAt = data.completedAt;
    this.parentItemId = data.parentItemId;
    // Migration logic: derive status if missing
    const migratedStatus: ItemInstanceStatus = (() => {
      if (data.status) return data.status;
      if (data.accountingStatus === 'success') return 'complete';
      if (data.accountingStatus === 'canceled') return 'canceled';
      if (data.accountingStatus === 'partial') return 'partial';
      if (data.isComplete) return 'complete';
      return 'pending';
    })();
    this.status = migratedStatus;
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
    // Derived legacy flag
    this.isComplete = this.status === 'complete';
    // Enforce invariants
    if ((this.status === 'complete' || this.status === 'canceled') && !this._completedAt) {
      // Auto-fill completedAt if terminal but not provided
      this._completedAt = Date.now();
    }
    if (this.status === 'partial' && this._completedAt) {
      // Partial should not have completedAt
      this._completedAt = undefined;
    }
  }

  toJSON(): ItemInstanceJSON {
    return {
      id: this.id,
      itemId: this.itemId,
      calendarEntryId: this.calendarEntryId,
      scheduledStartTime: this.scheduledStartTime,
      actualStartTime: this.actualStartTime,
      completedAt: this.completedAt,
      parentItemId: this.parentItemId,
      status: this.status,
      isComplete: this.isComplete, // transitional
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
      status: 'complete'
    });
  }

  markCanceled(canceledAt: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      completedAt: canceledAt,
      status: 'canceled'
    });
  }

  markPartial(): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      completedAt: undefined,
      status: 'partial'
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
    const mapped: ItemInstanceStatus | undefined =
      status === 'success' ? 'complete' : status === 'canceled' ? 'canceled' : status === 'partial' ? 'partial' : undefined;
    return new ItemInstanceImpl({
      ...this,
      accountingStatus: status,
      accountedAt: time,
      status: mapped || this.status
    });
  }

  // Mark accounting for a specific item id (one layer unwrapping when partial)
  markItemAccounting(itemId: string, status: 'success' | 'canceled' | 'partial', time: number = Date.now()): ItemInstanceImpl {
    const perItemAccounting = { ...(this.perItemAccounting || {}), [itemId]: status };
    const rootStatusUpdate = (itemId === this.itemId && (status === 'success' || status === 'canceled'))
      ? { accountingStatus: status, accountedAt: time, status: status === 'success' ? 'complete' : 'canceled' as ItemInstanceStatus }
      : { accountingStatus: this.accountingStatus, accountedAt: this.accountedAt };
    return new ItemInstanceImpl({
      ...this,
      ...rootStatusUpdate,
      perItemAccounting
    });
  }
}
