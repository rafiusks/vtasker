import React from 'react'
import { useDrag } from 'react-dnd'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  index: number
}

export function TaskCard({ task, index }: TaskCardProps) {
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

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-red-50 text-red-700',
  }

  return (
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
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'}`}
        >
          {task.priority}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
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
        <div className="flex-1 mr-2">
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
        </div>
        <div className="text-xs text-gray-500">
          Updated {new Date(task.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
} 