export type InputType = "text" | "number" | "select" | "date" | "assignee";

export interface Column {
  id: string;
  name: string;
  type: InputType;
}

// Define value types based on input types
export type TextValue = string;
export type NumberValue = number | string; // Can be string during input
export type SelectValue = "low" | "medium" | "high" | "";
export type DateValue = string; // ISO date string
export type AssigneeValue = "john" | "jane" | "alex" | "";

// Union type for all possible values
export type CellValue =
  | TextValue
  | NumberValue
  | SelectValue
  | DateValue
  | AssigneeValue;

// Map input types to their corresponding value types
export interface ValueTypeMap {
  text: TextValue;
  number: NumberValue;
  select: SelectValue;
  date: DateValue;
  assignee: AssigneeValue;
}

export interface Task {
  id: string;
  name: string;
  values: Record<string, CellValue>;
  children?: Task[];
}
