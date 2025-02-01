import React from 'react';
import { TagIcon, CalendarIcon, UserIcon } from '@heroicons/react/20/solid';
import type { Task } from '../types';

interface TaskMetadataProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
}

export function TaskMetadata({ task, onUpdate }: TaskMetadataProps) {
  const [newLabel, setNewLabel] = React.useState('');
  const [dueDate, setDueDate] = React.useState(task.content.due_date || '');
  const [assignee, setAssignee] = React.useState(task.content.assignee || '');

  // Update local state when task changes
  React.useEffect(() => {
    setDueDate(task.content.due_date || '');
    setAssignee(task.content.assignee || '');
  }, [task]);

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim() && !task.labels.includes(newLabel.trim())) {
      onUpdate({
        labels: [...task.labels, newLabel.trim()]
      });
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    onUpdate({
      labels: task.labels.filter(l => l !== label)
    });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDueDate(date);
    onUpdate({
      content: {
        ...task.content,
        due_date: date || undefined
      }
    });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAssignee(value);
    onUpdate({
      content: {
        ...task.content,
        assignee: value || undefined
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Labels Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Labels</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {task.labels.map(label => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
            >
              {label}
              <button
                type="button"
                onClick={() => handleRemoveLabel(label)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddLabel} className="flex gap-2">
          <div className="relative flex-grow">
            <TagIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add a label..."
              className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add
          </button>
        </form>
      </div>

      {/* Due Date Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Due Date</h3>
        <div className="relative">
          <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dueDate}
            onChange={handleDueDateChange}
            className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Assignee Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Assignee</h3>
        <div className="relative">
          <UserIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={assignee}
            onChange={handleAssigneeChange}
            placeholder="Assign to..."
            className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
    </div>
  );
} 