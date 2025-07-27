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

  constructor(data: {
    id?: string;
    itemId: string;
    calendarEntryId: string;
    scheduledStartTime: number;
    actualStartTime?: number;
    completedAt?: number;
    isComplete?: boolean;
    executionDetails?: Partial<InstanceExecutionDetails>;
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
      executionDetails: this.executionDetails
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
}
