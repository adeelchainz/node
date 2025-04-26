"use client";

import { SelectValue } from "@/components/ui/select";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Calendar,
  ListChecks,
  Type,
  Hash,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  Task,
  Column,
  InputType,
  CellValue,
  ValueTypeMap,
  SelectValue as SelectValueType,
  AssigneeValue,
} from "../dynamic-table/types";

interface ClickupTableProps {
  initialTasks: Task[];
  initialColumns: Column[];
}

export function List({ initialTasks, initialColumns }: ClickupTableProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<InputType>("text");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (taskId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const addColumn = () => {
    if (newColumnName.trim() === "") return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
    };

    setColumns([...columns, newColumn]);
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const removeColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId));
  };

  const updateTaskValue = <T extends InputType>(
    taskId: string,
    columnId: string,
    value: ValueTypeMap[T]
  ): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            values: {
              ...task.values,
              [columnId]: value,
            },
          };
        }

        // Also update in children if present
        if (task.children) {
          return {
            ...task,
            children: task.children.map((child) =>
              child.id === taskId
                ? { ...child, values: { ...child.values, [columnId]: value } }
                : child
            ),
          };
        }

        return task;
      })
    );

    // If the task is currently selected in the modal, update it there too
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        values: {
          ...selectedTask.values,
          [columnId]: value,
        },
      });
    }
  };

  const addSubtask = (parentId: string) => {
    const newSubtask: Task = {
      id: `task-${Date.now()}`,
      name: "New Subtask",
      values: {},
      children: [],
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === parentId) {
          return {
            ...task,
            children: [...(task.children || []), newSubtask],
          };
        }
        return task;
      })
    );

    // Expand the parent row
    setExpandedRows((prev) => ({
      ...prev,
      [parentId]: true,
    }));
  };

  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: "New Task",
      values: {},
      children: [],
    };

    setTasks([...tasks, newTask]);
  };

  const getValueForColumn = <T extends InputType>(
    task: Task,
    column: Column & { type: T }
  ): ValueTypeMap[T] => {
    if (column.id === "name") {
      return task.name as ValueTypeMap[T];
    }

    const value = task.values[column.id];
    return (
      value === undefined ? getDefaultValueForType(column.type) : value
    ) as ValueTypeMap[T];
  };

  const getDefaultValueForType = (type: InputType): CellValue => {
    switch (type) {
      case "text":
        return "";
      case "number":
        return "";
      case "select":
        return "";
      case "date":
        return "";
      case "assignee":
        return "";
    }
  };

  const renderCellContent = (task: Task, column: Column) => {
    if (column.id === "name") {
      return (
        <Input
          value={task.name}
          onChange={(e) => {
            // Update task name
            setTasks((prevTasks) =>
              prevTasks.map((t) => {
                if (t.id === task.id) {
                  return { ...t, name: e.target.value };
                }
                // Check in children
                if (t.children) {
                  return {
                    ...t,
                    children: t.children.map((child) =>
                      child.id === task.id
                        ? { ...child, name: e.target.value }
                        : child
                    ),
                  };
                }
                return t;
              })
            );
          }}
          className="h-8 font-medium border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    switch (column.type) {
      case "text": {
        const value = getValueForColumn(
          task,
          column as Column & { type: "text" }
        );
        return (
          <Input
            value={value}
            onChange={(e) =>
              updateTaskValue<"text">(task.id, column.id, e.target.value)
            }
            className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      case "number": {
        const value = getValueForColumn(
          task,
          column as Column & { type: "number" }
        );
        return (
          <Input
            type="number"
            value={value.toString()}
            onChange={(e) =>
              updateTaskValue<"number">(task.id, column.id, e.target.value)
            }
            className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      case "select": {
        const value = getValueForColumn(
          task,
          column as Column & { type: "select" }
        ) as SelectValueType;
        return (
          <Select
            value={value}
            onValueChange={(val) =>
              updateTaskValue<"select">(
                task.id,
                column.id,
                val as SelectValueType
              )
            }
          >
            <SelectTrigger
              className="h-8 border-0 bg-transparent px-0 focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      case "date": {
        const value = getValueForColumn(
          task,
          column as Column & { type: "date" }
        );
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) =>
              updateTaskValue<"date">(task.id, column.id, e.target.value)
            }
            className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      case "assignee": {
        const value = getValueForColumn(
          task,
          column as Column & { type: "assignee" }
        ) as AssigneeValue;
        return (
          <Select
            value={value}
            onValueChange={(val) =>
              updateTaskValue<"assignee">(
                task.id,
                column.id,
                val as AssigneeValue
              )
            }
          >
            <SelectTrigger
              className="h-8 border-0 bg-transparent px-0 focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="john">John Doe</SelectItem>
              <SelectItem value="jane">Jane Smith</SelectItem>
              <SelectItem value="alex">Alex Johnson</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      default:
        return null;
    }
  };

  const renderTaskRow = (task: Task, level = 0) => {
    const isExpanded = expandedRows[task.id] || false;
    const hasChildren = task.children && task.children.length > 0;

    return (
      <div key={task.id} className="mb-2">
        <div
          className="bg-white rounded-md border border-muted hover:bg-muted/5 transition-colors cursor-pointer"
          onClick={() => handleRowClick(task)}
        >
          <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_repeat(5,1fr)] gap-4 p-3 items-center">
            {/* Expand/Collapse and Name Column */}
            <div className="flex items-center gap-2">
              <div style={{ width: `${level * 24}px` }} />
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(task.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              {renderCellContent(task, columns[0])}
            </div>

            {/* Other Columns */}
            {columns.slice(1).map((column) => (
              <div key={column.id} className="flex items-center">
                <div className="w-full">
                  <div className="text-xs text-muted-foreground mb-1 md:hidden">
                    {column.name}
                  </div>
                  {renderCellContent(task, column)}
                </div>
              </div>
            ))}

            {/* Add Subtask Button */}
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  addSubtask(task.id);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Children Container */}
        {isExpanded && task.children && task.children.length > 0 && (
          <div className="ml-8 mt-2">
            {task.children.map((child) => renderTaskRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getInputTypeIcon = (type: InputType) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />;
      case "number":
        return <Hash className="h-4 w-4" />;
      case "select":
        return <ListChecks className="h-4 w-4" />;
      case "date":
        return <Calendar className="h-4 w-4" />;
      case "assignee":
        return <Users className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-md">
      <div className="flex justify-between items-center p-4 mb-4">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingColumn(true)}
          >
            Add Column
          </Button>
          <Button variant="default" size="sm" onClick={addTask}>
            Add Task
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_repeat(5,1fr)] gap-4 px-3 py-2 mb-2 font-medium text-sm text-muted-foreground">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-1">
                {getInputTypeIcon(column.type)}
                <span>{column.name}</span>
                {column.id !== "name" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1 p-0"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => removeColumn(column.id)}>
                        Remove Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
            <div></div> {/* Empty cell for action buttons */}
          </div>

          <div className="space-y-1">
            {tasks.map((task) => renderTaskRow(task))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask && (
                <Input
                  value={selectedTask.name}
                  onChange={(e) => {
                    if (selectedTask) {
                      setSelectedTask({
                        ...selectedTask,
                        name: e.target.value,
                      });

                      // Update in the main tasks list
                      setTasks((prevTasks) =>
                        prevTasks.map((task) => {
                          if (task.id === selectedTask.id) {
                            return { ...task, name: e.target.value };
                          }

                          // Check in children
                          if (task.children) {
                            return {
                              ...task,
                              children: task.children.map((child) =>
                                child.id === selectedTask.id
                                  ? { ...child, name: e.target.value }
                                  : child
                              ),
                            };
                          }

                          return task;
                        })
                      );
                    }
                  }}
                  className="text-xl font-bold h-10"
                />
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="grid gap-4 py-4">
              {columns
                .filter((col) => col.id !== "name")
                .map((column) => (
                  <div
                    key={column.id}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <label className="text-right font-medium">
                      {column.name}
                    </label>
                    <div className="col-span-3">
                      {renderCellContent(selectedTask, column)}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Column Popover */}
      <Popover open={isAddingColumn} onOpenChange={setIsAddingColumn}>
        <PopoverTrigger asChild>
          <div> {/* Empty trigger, controlled programmatically */}</div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <h3 className="font-medium">Add New Column</h3>
            <div className="grid gap-2">
              <label htmlFor="column-name" className="text-sm">
                Column Name
              </label>
              <Input
                id="column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="column-type" className="text-sm">
                Column Type
              </label>
              <Select
                value={newColumnType}
                onValueChange={(val: InputType) => setNewColumnType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingColumn(false)}
              >
                Cancel
              </Button>
              <Button onClick={addColumn}>Add Column</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
