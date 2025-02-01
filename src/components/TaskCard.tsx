import React from 'react'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-red-50 text-red-700',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 mr-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
        </div>
        <div className="flex items-start gap-1.5 flex-shrink-0">
          <code className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] leading-[14px] font-mono rounded">
            {task.id}
          </code>
          <span className={`px-1.5 py-0.5 rounded text-[10px] leading-[14px] font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(label => (
            <span
              key={label}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Updated {new Date(task.updated_at).toLocaleDateString()}
      </div>
    </div>
  )
} 