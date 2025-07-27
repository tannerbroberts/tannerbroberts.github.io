export interface Variable {
  readonly type: "variable";
  readonly name: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly category?: string;
}

export interface VariableJSON {
  type: "variable";
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

export interface VariableSummary {
  readonly [variableName: string]: {
    readonly quantity: number;
    readonly unit?: string;
    readonly category?: string;
  };
}

export class VariableImpl implements Variable {
  readonly type = "variable" as const;
  readonly name: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly category?: string;

  constructor(data: {
    name: string;
    quantity: number;
    unit?: string;
    category?: string;
  }) {
    this.name = data.name.trim().toLowerCase(); // Normalize name for consistency
    this.quantity = data.quantity;
    this.unit = data.unit?.trim();
    this.category = data.category?.trim();
  }

  toJSON(): VariableJSON {
    return {
      type: this.type,
      name: this.name,
      quantity: this.quantity,
      unit: this.unit,
      category: this.category
    };
  }

  static fromJSON(json: VariableJSON): VariableImpl {
    return new VariableImpl(json);
  }

  // Combine with another variable of the same name
  combine(other: Variable): VariableImpl {
    if (this.name !== other.name) {
      throw new Error(`Cannot combine variables with different names: ${this.name} and ${other.name}`);
    }

    return new VariableImpl({
      name: this.name,
      quantity: this.quantity + other.quantity,
      unit: this.unit || other.unit, // Use first available unit
      category: this.category || other.category // Use first available category
    });
  }
}
