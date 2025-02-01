import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PlusIcon } from '@heroicons/react/20/solid'
import { TaskForm } from './components/TaskForm'
import { TaskColumn } from './components/TaskColumn'
import { Select, type Option } from './components/Select'
import type { Task } from './types'
import { StatusNotification } from './components/StatusNotification'

type FilterState = {
  status: string[];
  priority: string[];
  labels: string[];
  sortBy: 'created_at' | 'priority';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: FilterState = {
  status: [],
  priority: [],
  labels: [],
  sortBy: 'created_at',
  sortOrder: 'desc'
};

const statusOptions: Option[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const priorityOptions: Option[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const sortOptions: Option[] = [
  { value: 'created_at', label: 'Creation Date' },
  { value: 'priority', label: 'Priority' },
]

const sortOrderOptions: Option[] = [
  { value: 'asc', label: '↑' },
  { value: 'desc', label: '↓' },
]

export function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [notification, setNotification] = useState<{
    show: boolean;
    taskTitle: string;
    fromStatus: string;
    toStatus: string;
  }>({
    show: false,
    taskTitle: '',
    fromStatus: '',
    toStatus: '',
  });

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const urlFilters: Partial<FilterState> = {};

    // Parse array parameters
    const arrayParams = ['status', 'priority', 'labels'] as const;
    for (const key of arrayParams) {
      const value = params.get(key);
      if (value) {
        urlFilters[key] = value.split(',') as FilterState[typeof key];
      }
    }

    // Parse single value parameters
    const sortBy = params.get('sortBy');
    if (sortBy === 'created_at' || sortBy === 'priority') {
      urlFilters.sortBy = sortBy;
    }

    const sortOrder = params.get('sortOrder');
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      urlFilters.sortOrder = sortOrder;
    }

    setFilters(prev => ({ ...prev, ...urlFilters }));
    setFiltersLoading(false);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (filtersLoading) return;

    const params = new URLSearchParams();
    
    // Only add non-empty array filters to URL
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (!Array.isArray(value)) {
        params.set(key, value);
      }
    }

    const newUrl = params.toString()
      ? `${globalThis.location.pathname}?${params.toString()}`
      : globalThis.location.pathname;
      
    globalThis.history.replaceState({}, '', newUrl);
  }, [filters, filtersLoading]);

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/tasks', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
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

  const filteredTasks = tasks.filter(task => {
    if (filters.status.length && !filters.status.includes(task.status)) return false;
    if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
    if (filters.labels.length && !filters.labels.some(label => task.labels.includes(label))) return false;
    return true;
  }).sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    const getValue = (task: Task) => {
      if (filters.sortBy === 'created_at') {
        return new Date(task.created_at).getTime();
      }
      return priorityOrder[task.priority];
    };
    const aValue = getValue(a);
    const bValue = getValue(b);
    return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const columns = {
    backlog: filteredTasks.filter(t => t.status === 'backlog').sort((a, b) => a.order - b.order),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress').sort((a, b) => a.order - b.order),
    review: filteredTasks.filter(t => t.status === 'review').sort((a, b) => a.order - b.order),
    done: filteredTasks.filter(t => t.status === 'done').sort((a, b) => a.order - b.order),
  }

  const allLabels = Array.from(new Set(tasks.flatMap(t => t.labels)));

  const handleFilterChange = (type: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }

  const clearFilters = () => {
    setFilters(defaultFilters);
  }

  const activeFilterCount = filters.status.length + filters.priority.length + filters.labels.length;

  const handleTaskMove = async (taskId: string, newStatus: Task['status'], newIndex?: number) => {
    try {
      const updates: { status?: string, order?: number } = {}
      
      if (newStatus) {
        updates.status = newStatus
      }
      
      if (typeof newIndex === 'number') {
        updates.order = newIndex
      }

      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      // Optimistically update the UI
      setTasks(prev => {
        const updatedTasks = [...prev]
        const taskIndex = updatedTasks.findIndex(t => t.id === taskId)
        
        if (taskIndex === -1) return prev
        
        const task = { ...updatedTasks[taskIndex] }
        
        if (newStatus && newStatus !== task.status) {
          // Show notification for status change
          setNotification({
            show: true,
            taskTitle: task.title,
            fromStatus: task.status,
            toStatus: newStatus,
          });
          task.status = newStatus
        }
        
        if (typeof newIndex === 'number') {
          // Remove task from its current position
          updatedTasks.splice(taskIndex, 1)
          // Insert it at the new position
          updatedTasks.splice(newIndex, 0, task)
          
          // Update order for all tasks in the column
          const columnTasks = updatedTasks.filter(t => t.status === task.status)
          columnTasks.forEach((t, i) => {
            t.order = i
          })
        } else {
          updatedTasks[taskIndex] = task
        }
        
        return updatedTasks
      })
    } catch (err) {
      console.error('Failed to move task:', err)
      setError(err instanceof Error ? err.message : 'Failed to move task')
      
      // Reload tasks to ensure UI is in sync with server
      loadTasks()
    }
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newTask = await response.json() as Task
      
      // Update tasks while maintaining sort order
      setTasks(prev => {
        const updatedTasks = [...prev, newTask]
        return updatedTasks.sort((a, b) => {
          if (filters.sortBy === 'created_at') {
            return filters.sortOrder === 'desc'
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          }
          const priorityOrder: Record<Task['priority'], number> = { high: 3, normal: 2, low: 1 }
          return filters.sortOrder === 'desc'
            ? priorityOrder[b.priority] - priorityOrder[a.priority]
            : priorityOrder[a.priority] - priorityOrder[b.priority]
        })
      })
      
      setIsTaskFormOpen(false)
    } catch (err) {
      console.error('Failed to create task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleEditTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    if (!editingTask) return

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedTask = await response.json()
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ))
      setEditingTask(undefined)
    } catch (err) {
      console.error('Failed to update task:', err)
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const openEditForm = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const closeTaskForm = () => {
    setIsTaskFormOpen(false)
    setEditingTask(undefined)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      // Remove task from state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading || filtersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">vTask Board</h1>
              <p className="text-lg text-gray-600">Manage your tasks with ease</p>
            </div>
            <button
              type="button"
              onClick={() => setIsTaskFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              New Task
            </button>
          </div>
        </header>

        {/* Filter Controls */}
        <div className="max-w-7xl mx-auto mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-start gap-4">
              {/* Status & Priority Filters */}
              <div className="flex items-start gap-4">
                <Select
                  id="status-filter"
                  label="Status"
                  value={filters.status}
                  onChange={value => handleFilterChange('status', value)}
                  options={statusOptions}
                  badge={filters.status.length}
                  multiple
                  className="w-[180px]"
                />
                <Select
                  id="priority-filter"
                  label="Priority"
                  value={filters.priority}
                  onChange={value => handleFilterChange('priority', value)}
                  options={priorityOptions}
                  badge={filters.priority.length}
                  multiple
                  className="w-[180px]"
                />
              </div>

              {/* Labels Filter */}
              <Select
                id="labels-filter"
                label="Labels"
                value={filters.labels}
                onChange={value => handleFilterChange('labels', value)}
                options={allLabels.map(label => ({ value: label, label }))}
                badge={filters.labels.length}
                multiple
                className="w-[180px]"
              />

              {/* Sort Controls */}
              <div className="flex items-start gap-2">
                <Select
                  id="sort-by"
                  label="Sort By"
                  value={[filters.sortBy]}
                  onChange={([value]) => handleFilterChange('sortBy', value)}
                  options={sortOptions}
                  className="w-[180px]"
                />
                <Select
                  id="sort-order"
                  label="Order"
                  value={[filters.sortOrder]}
                  onChange={([value]) => handleFilterChange('sortOrder', value)}
                  options={sortOrderOptions}
                  isIconOnly
                  className="mt-5"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.entries(columns) as [Task['status'], Task[]][]).map(([status, columnTasks]) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={columnTasks}
                onDrop={handleTaskMove}
                onEdit={openEditForm}
                onDelete={handleDeleteTask}
                allTasks={tasks}
              />
            ))}
          </div>
        </main>

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={closeTaskForm}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          task={editingTask}
          allTasks={tasks}
        />
        <StatusNotification
          show={notification.show}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          taskTitle={notification.taskTitle}
          fromStatus={notification.fromStatus}
          toStatus={notification.toStatus}
        />
      </div>
    </DndProvider>
  )
} 