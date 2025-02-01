import { useState } from 'react'
import { useDrag } from 'react-dnd'
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Dialog } from '@headlessui/react'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  index: number
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  allTasks?: Task[]
}

export function TaskCard({ task, index, onEdit, onDelete, allTasks = [] }: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [{ isDragging }, dragRef] = useDrag({
    type: 'TASK',
    item: { 
      id: task.id,
      status: task.status,
      index,
      type: 'TASK'
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Count relationships
  const dependentCount = allTasks.filter(t => t.dependencies.includes(task.id)).length;
  const hasDependencies = task.dependencies.length > 0;

  const handleDelete = () => {
    onDelete?.(task.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <div
        ref={dragRef}
        className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
            ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
              task.priority === 'normal' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'}`}
          >
            {task.priority}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
        
        {/* Relationship Indicators */}
        {(dependentCount > 0 || hasDependencies) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {hasDependencies && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700" title="This task depends on other tasks">
                →
                {task.dependencies.length} {task.dependencies.length === 1 ? 'dependency' : 'dependencies'}
              </span>
            )}
            {dependentCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" title="Other tasks depend on this task">
                ←
                {dependentCount} {dependentCount === 1 ? 'dependent' : 'dependents'}
              </span>
            )}
          </div>
        )}

        {task.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.labels.map(label => (
              <span
                key={label}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(task.id)
              }}
              className="inline-flex items-center text-gray-400 hover:text-gray-500"
              title="Copy task ID"
            >
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Copy task ID icon"
                role="img"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="inline-flex items-center text-gray-400 hover:text-gray-500"
                title="Edit task"
              >
                <PencilIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center text-gray-400 hover:text-red-500"
                title="Delete task"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Updated {new Date(task.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-4 shadow-lg">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Delete Task
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this task? This action cannot be undone.
              {task.dependencies.length > 0 && (
                <p className="mt-2 text-red-600">
                  Warning: This task has dependencies. Deleting it may affect other tasks.
                </p>
              )}
            </Dialog.Description>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 