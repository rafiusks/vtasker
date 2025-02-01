import React, { useState, useEffect } from 'react'
import { TaskCard } from './components/TaskCard'
import { Select, type Option } from './components/Select'
import type { Task } from './types'

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

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
      
    window.history.replaceState({}, '', newUrl);
  }, [filters, filtersLoading]);

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

  const filteredTasks = tasks.filter(task => {
    if (filters.status.length && !filters.status.includes(task.status)) return false;
    if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
    if (filters.labels.length && !filters.labels.some(label => task.labels.includes(label))) return false;
    return true;
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
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
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done'),
  }

  const allLabels = Array.from(new Set(tasks.flatMap(t => t.labels)));

  const handleFilterChange = (type: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }

  const clearFilters = () => {
    setFilters(defaultFilters);
  }

  const activeFilterCount = filters.status.length + filters.priority.length + filters.labels.length;

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">vTask Board</h1>
        <p className="text-lg text-gray-600">Manage your tasks with ease</p>
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
              <span className="ml-2 text-gray-400 text-sm">({columns['in-progress'].length})</span>
            </h2>
            <div className="space-y-3">
              {columns['in-progress'].map(task => (
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