import React from 'react'
import { Task } from '../types'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
}

const typeIcons = {
  feature: "✨",
  bug: "🐛",
  chore: "🔧",
  docs: "📝",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 truncate flex-1" title={task.title}>
          {task.title}
        </h3>
        <span className="ml-2 text-gray-400 text-xs font-mono" title="Task ID">
          {task.id}
        </span>
      </div>
      
      <div 
        className="mb-3 text-sm text-gray-600 prose-sm"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(task.description) }}
      />
      
      <div className="flex items-center gap-2 flex-wrap">
        <span 
          className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}
          title="Priority"
        >
          {task.priority}
        </span>
        
        <span 
          className="text-sm bg-gray-50 px-2 py-1 rounded-full flex items-center gap-1" 
          title={`Type: ${task.type}`}
        >
          <span>{typeIcons[task.type]}</span>
          <span className="text-xs text-gray-600">{task.type}</span>
        </span>
        
        <span className="text-xs text-gray-400 ml-auto" title="Created date">
          {formatDate(task.created)}
        </span>
      </div>
    </div>
  )
} 