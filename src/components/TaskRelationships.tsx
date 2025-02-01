import React from 'react';
import { ArrowsPointingOutIcon, ArrowTopRightOnSquareIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';
import type { Task } from '../types';

interface TaskRelationshipsProps {
  task: Task;
  allTasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

interface RelatedTask {
  id: string;
  title: string;
  type: 'parent' | 'child' | 'dependency' | 'dependent';
}

export function TaskRelationships({ task, allTasks, onTaskClick }: TaskRelationshipsProps) {
  // Get all related tasks
  const relatedTasks: RelatedTask[] = [];

  // Add parent if exists
  if (task.parent) {
    const parentTask = allTasks.find(t => t.id === task.parent);
    if (parentTask) {
      relatedTasks.push({
        id: parentTask.id,
        title: parentTask.title,
        type: 'parent'
      });
    }
  }

  // Add children
  const childTasks = allTasks.filter(t => t.parent === task.id);
  relatedTasks.push(...childTasks.map(t => ({
    id: t.id,
    title: t.title,
    type: 'child' as const
  })));

  // Add dependencies
  for (const depId of task.dependencies) {
    // Clean up dependency ID (remove any description in parentheses)
    const cleanDepId = depId.replace(/\s*\(.*\)\s*$/, '');
    const depTask = allTasks.find(t => t.id === cleanDepId);
    if (depTask) {
      relatedTasks.push({
        id: depTask.id,
        title: depTask.title,
        type: 'dependency'
      });
    }
  }

  // Add dependent tasks (tasks that depend on this one)
  const dependentTasks = allTasks.filter(t => {
    // Clean up each dependency ID in the task
    const cleanDeps = t.dependencies.map(d => d.replace(/\s*\(.*\)\s*$/, ''));
    return cleanDeps.includes(task.id);
  });
  relatedTasks.push(...dependentTasks.map(t => ({
    id: t.id,
    title: t.title,
    type: 'dependent' as const
  })));

  if (relatedTasks.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No relationships
      </div>
    );
  }

  const getRelationshipIcon = (type: RelatedTask['type']) => {
    switch (type) {
      case 'parent':
        return <ArrowsPointingOutIcon className="h-4 w-4 -rotate-45" />;
      case 'child':
        return <ArrowsPointingOutIcon className="h-4 w-4 rotate-135" />;
      case 'dependency':
        return <ArrowLongRightIcon className="h-4 w-4" />;
      case 'dependent':
        return <ArrowLongRightIcon className="h-4 w-4 rotate-180" />;
    }
  };

  const getRelationshipLabel = (type: RelatedTask['type']) => {
    switch (type) {
      case 'parent':
        return 'Parent';
      case 'child':
        return 'Child';
      case 'dependency':
        return 'Depends on';
      case 'dependent':
        return 'Required by';
    }
  };

  const getRelationshipColor = (type: RelatedTask['type']) => {
    switch (type) {
      case 'parent':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'child':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'dependency':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dependent':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-3">
      {relatedTasks.map(relatedTask => (
        <div
          key={`${relatedTask.type}-${relatedTask.id}`}
          className={`relative group rounded-lg border p-3 ${getRelationshipColor(relatedTask.type)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRelationshipIcon(relatedTask.type)}
              <span className="text-xs font-medium">
                {getRelationshipLabel(relatedTask.type)}
              </span>
            </div>
            {onTaskClick && (
              <button
                type="button"
                onClick={() => onTaskClick(relatedTask.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="View task"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm font-medium truncate">
            {relatedTask.title}
          </p>
          <div className="mt-1 text-xs opacity-60">
            {relatedTask.id}
          </div>
        </div>
      ))}
    </div>
  );
} 