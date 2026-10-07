"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Check, ListChecks, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateMeetingActionItem,
  useDeleteActionItem,
  useMeetingActionItems,
  useUpdateActionItem,
} from "@/hooks/use-meetings";
import type { ActionItem } from "@/types";

type ActionItemsPanelProps = {
  meetingId: number;
};

type ActionItemFormValues = {
  task: string;
  assignee: string;
  dueDate: string;
};

const emptyForm: ActionItemFormValues = {
  task: "",
  assignee: "",
  dueDate: "",
};

function dateInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function apiDateValue(value: string): string | null {
  return value ? `${value}T00:00:00` : null;
}

function formatDueDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function ActionItemEditor({
  initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  initialValues: ActionItemFormValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: ActionItemFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const task = values.task.trim();
    if (!task) {
      setError("Enter an action item.");
      return;
    }
    setError(null);
    try {
      await onSubmit({ ...values, task });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the action item. Please try again.",
      );
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label htmlFor="action-item-task">Task</Label>
        <Input
          autoFocus
          id="action-item-task"
          maxLength={2000}
          onChange={(event) => setValues({ ...values, task: event.target.value })}
          placeholder="What needs to be done?"
          required
          value={values.task}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="action-item-assignee">Assignee (optional)</Label>
          <Input
            id="action-item-assignee"
            onChange={(event) => setValues({ ...values, assignee: event.target.value })}
            placeholder="Name"
            value={values.assignee}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="action-item-due-date">Due date (optional)</Label>
          <Input
            id="action-item-due-date"
            onChange={(event) => setValues({ ...values, dueDate: event.target.value })}
            type="date"
            value={values.dueDate}
          />
        </div>
      </div>
      {error ? (
        <p aria-live="polite" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button disabled={isPending} onClick={onCancel} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
        <Button disabled={isPending} size="sm" type="submit">
          {isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function ActionItemsPanel({ meetingId }: ActionItemsPanelProps) {
  const actionItemsQuery = useMeetingActionItems(meetingId);
  const createMutation = useCreateMeetingActionItem(meetingId);
  const updateMutation = useUpdateActionItem(meetingId);
  const deleteMutation = useDeleteActionItem(meetingId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const items = actionItemsQuery.data ?? [];
  const completedCount = items.filter((item) => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  async function addActionItem(values: ActionItemFormValues) {
    try {
      await createMutation.mutateAsync({
        task: values.task,
        assignee: values.assignee.trim() || null,
        due_date: apiDateValue(values.dueDate),
      });
      toast.success("Action item added");
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add the action item"));
      throw error;
    }
  }

  async function saveActionItem(item: ActionItem, values: ActionItemFormValues) {
    try {
      await updateMutation.mutateAsync({
        actionItemId: item.id,
        payload: {
          task: values.task,
          assignee: values.assignee.trim() || null,
          due_date: apiDateValue(values.dueDate),
        },
      });
      toast.success("Action item updated");
      setEditingItemId(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the action item"));
      throw error;
    }
  }

  async function toggleActionItem(item: ActionItem) {
    try {
      await updateMutation.mutateAsync({
        actionItemId: item.id,
        payload: { completed: !item.completed },
      });
      toast.success(item.completed ? "Action item reopened" : "Action item completed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the action item"));
    }
  }

  async function removeActionItem(item: ActionItem) {
    if (!window.confirm(`Delete "${item.task}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success("Action item deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the action item"));
    }
  }

  function editValues(item: ActionItem): ActionItemFormValues {
    return {
      task: item.task,
      assignee: item.assignee ?? "",
      dueDate: dateInputValue(item.due_date),
    };
  }

  return (
    <section aria-label="Meeting action items" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-heading">Action Items</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "task" : "tasks"} · {completedCount} completed
          </p>
        </div>
        <Button
          disabled={isAdding}
          onClick={() => setIsAdding(true)}
          size="sm"
          type="button"
        >
          <Plus aria-hidden="true" />
          Add action item
        </Button>
      </div>

      <div aria-label={`${completedCount} of ${items.length} action items completed`}>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isAdding ? (
        <ActionItemEditor
          initialValues={emptyForm}
          isPending={createMutation.isPending}
          onCancel={() => setIsAdding(false)}
          onSubmit={addActionItem}
          submitLabel="Add task"
        />
      ) : null}

      {actionItemsQuery.isPending ? (
        <div aria-label="Loading action items" className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="h-20 animate-pulse rounded-xl border border-border bg-slate-50" key={index} />
          ))}
        </div>
      ) : actionItemsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4" role="alert">
          <p className="text-sm font-medium text-heading">Couldn’t load action items</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getErrorMessage(actionItemsQuery.error, "An unexpected error occurred.")}
          </p>
          <Button
            className="mt-3"
            onClick={() => void actionItemsQuery.refetch()}
            size="sm"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-violet-50 text-primary">
            <ListChecks aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-heading">No action items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a task to keep track of the next steps from this meeting.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const isUpdating = updateMutation.isPending && updateMutation.variables?.actionItemId === item.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.id;
            const dueDate = formatDueDate(item.due_date);

            return (
              <li
                className={`rounded-xl border p-3 transition-colors ${
                  item.completed
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-border bg-white"
                }`}
                key={item.id}
              >
                {editingItemId === item.id ? (
                  <ActionItemEditor
                    initialValues={editValues(item)}
                    isPending={isUpdating}
                    onCancel={() => setEditingItemId(null)}
                    onSubmit={(values) => saveActionItem(item, values)}
                    submitLabel="Save changes"
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      aria-checked={item.completed}
                      aria-label={item.completed ? "Mark action item incomplete" : "Mark action item complete"}
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                        item.completed
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-transparent hover:border-primary"
                      }`}
                      disabled={isUpdating || isDeleting}
                      onClick={() => void toggleActionItem(item)}
                      role="checkbox"
                      type="button"
                    >
                      {item.completed ? <Check aria-hidden="true" className="size-3.5" /> : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium leading-5 ${
                          item.completed ? "text-slate-400 line-through" : "text-heading"
                        }`}
                      >
                        {item.task}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {item.assignee ? <span>Assigned to {item.assignee}</span> : null}
                        {dueDate ? (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays aria-hidden="true" className="size-3.5" />
                            Due {dueDate}
                          </span>
                        ) : null}
                        {item.completed ? (
                          <span className="font-medium text-emerald-700">Completed</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        aria-label={`Edit ${item.task}`}
                        disabled={isUpdating || isDeleting}
                        onClick={() => setEditingItemId(item.id)}
                        size="icon-sm"
                        title="Edit"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={`Delete ${item.task}`}
                        disabled={isUpdating || isDeleting}
                        onClick={() => void removeActionItem(item)}
                        size="icon-sm"
                        title="Delete"
                        type="button"
                        variant="ghost"
                      >
                        {isDeleting ? (
                          <LoaderCircle aria-hidden="true" className="animate-spin" />
                        ) : (
                          <Trash2 aria-hidden="true" className="text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
