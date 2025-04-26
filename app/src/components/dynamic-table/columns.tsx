import type { Column } from "../dynamic-table/types";

export const columns: Column[] = [
  {
    id: "name",
    name: "Task Name",
    type: "text",
  },
  {
    id: "status",
    name: "Status",
    type: "select",
  },
  {
    id: "priority",
    name: "Priority",
    type: "select",
  },
  {
    id: "dueDate",
    name: "Due Date",
    type: "date",
  },
  {
    id: "assignee",
    name: "Assignee",
    type: "assignee",
  },
];
