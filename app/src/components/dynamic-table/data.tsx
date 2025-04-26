import type { Task } from "../dynamic-table/types";

export const tasks: Task[] = [
  {
    id: "task-1",
    name: "Website Redesign",
    values: {
      status: "medium",
      priority: "high",
      dueDate: "2023-12-15",
      assignee: "john",
    },
    children: [
      {
        id: "task-1-1",
        name: "Homepage Layout",
        values: {
          status: "low",
          priority: "medium",
          dueDate: "2023-12-10",
          assignee: "jane",
        },
        children: [],
      },
      {
        id: "task-1-2",
        name: "Product Page Templates",
        values: {
          status: "medium",
          priority: "medium",
          dueDate: "2023-12-12",
          assignee: "alex",
        },
        children: [],
      },
    ],
  },
  {
    id: "task-2",
    name: "Content Migration",
    values: {
      status: "high",
      priority: "medium",
      dueDate: "2023-12-20",
      assignee: "jane",
    },
    children: [],
  },
  {
    id: "task-3",
    name: "SEO Optimization",
    values: {
      status: "low",
      priority: "high",
      dueDate: "2023-12-25",
      assignee: "alex",
    },
    children: [
      {
        id: "task-3-1",
        name: "Keyword Research",
        values: {
          status: "medium",
          priority: "medium",
          dueDate: "2023-12-18",
          assignee: "john",
        },
        children: [],
      },
    ],
  },
];
