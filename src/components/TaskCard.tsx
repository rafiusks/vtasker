import React, { useState } from 'react'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [copied, setCopied] = useState(false)

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-red-50 text-red-700',
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(task.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 mr-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
        </div>
        <div className="flex items-start gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopyId}
            type="button"
            className="group flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] leading-[14px] font-mono rounded cursor-pointer transition-colors"
            title="Click to copy ID"
            aria-label={`Copy task ID: ${task.id}`}
          >
            {task.id}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className={`transition-opacity ${copied ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {copied ? (
                // Checkmark icon
                <path d="M20 6L9 17L4 12" />
              ) : (
                // Copy icon
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
          </button>
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