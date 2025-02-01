import React, { useState, useEffect } from 'react'
import { TaskCard } from './components/TaskCard'
import type { Task } from './types'

export function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
      console.error(err)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const columns = {
    backlog: tasks.filter(t => t.status === 'backlog'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">vTask Board</h1>
        <p className="text-lg text-gray-600">Manage your tasks with ease</p>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Backlog Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <span className="w-6 h-6 inline-flex items-center justify-center mr-2 text-base">📥</span>
              Backlog
              <span className="ml-2 text-gray-400 text-sm">({columns.backlog.length})</span>
            </h2>
            <div className="space-y-3">
              {columns.backlog.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <span className="w-6 h-6 inline-flex items-center justify-center mr-2 text-base">🏃</span>
              In Progress
              <span className="ml-2 text-gray-400 text-sm">({columns.in_progress.length})</span>
            </h2>
            <div className="space-y-3">
              {columns.in_progress.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Review Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <span className="w-6 h-6 inline-flex items-center justify-center mr-2 text-base">👀</span>
              Review
              <span className="ml-2 text-gray-400 text-sm">({columns.review.length})</span>
            </h2>
            <div className="space-y-3">
              {columns.review.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <span className="w-6 h-6 inline-flex items-center justify-center mr-2 text-base">✅</span>
              Done
              <span className="ml-2 text-gray-400 text-sm">({columns.done.length})</span>
            </h2>
            <div className="space-y-3">
              {columns.done.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 