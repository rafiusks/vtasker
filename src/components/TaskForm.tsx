import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Select } from './Select'
import type { Task } from '../types'
import { TaskRelationships } from './TaskRelationships'
import { TaskMetadata } from './TaskMetadata'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => void
  task?: Task
  allTasks?: Task[]
}

const initialFormState = {
  title: '',
  description: '',
  status: 'backlog' as Task['status'],
  priority: 'normal' as Task['priority'],
  type: 'feature' as Task['type'],
  labels: [] as string[],
  dependencies: [] as string[],
  content: {
    description: '',
    acceptance_criteria: [] as string[],
    implementation_details: '',
    notes: '',
    attachments: [] as string[],
    due_date: '',
    assignee: ''
  },
  status_history: [] as Task['status_history']
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

const statusOptions = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const typeOptions = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'docs', label: 'Documentation' },
  { value: 'chore', label: 'Chore' },
]

export const TaskForm: FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, task, allTasks = [] }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>>(initialFormState)
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        labels: task.labels,
        dependencies: task.dependencies,
        content: {
          ...task.content,
          due_date: task.content.due_date || '',
          assignee: task.content.assignee || ''
        },
        status_history: task.status_history
      })
    } else {
      setFormData(initialFormState)
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean up dependencies to only include the task IDs
    const cleanDependencies = formData.dependencies.map(dep => {
      const match = dep.match(/^(task-\d{3}(-\d{1,2})?)/);
      return match ? match[1] : dep;
    });
    
    // Create the submit data with clean dependencies
    const submitData = {
      ...formData,
      dependencies: cleanDependencies,
      content: {
        ...formData.content,  // Preserve all content fields
        implementation_details: formData.content.implementation_details || undefined,
        notes: formData.content.notes || undefined,
        due_date: formData.content.due_date || undefined,
        assignee: formData.content.assignee || undefined
      }
    }
    
    // Log the data being submitted for debugging
    console.log('Submitting task data:', submitData);
    
    onSubmit(submitData)
    onClose()
  }

  const openEditForm = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      labels: task.labels,
      dependencies: task.dependencies,
      content: {
        ...task.content,
        due_date: task.content.due_date || '',
        assignee: task.content.assignee || ''
      },
      status_history: task.status_history
    })
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-6">
            <form className="col-span-2 space-y-4" onSubmit={handleSubmit}>
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter task description"
                  required
                />
              </div>

              {/* Status, Priority, and Type */}
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={value => {
                    if (value === 'backlog' || value === 'in-progress' || value === 'review' || value === 'done') {
                      setFormData(prev => ({ ...prev, status: value }));
                    }
                  }}
                  options={statusOptions}
                />
                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={value => {
                    if (value === 'low' || value === 'normal' || value === 'high') {
                      setFormData(prev => ({ ...prev, priority: value }));
                    }
                  }}
                  options={priorityOptions}
                />
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={value => {
                    if (value === 'feature' || value === 'bug' || value === 'docs' || value === 'chore') {
                      setFormData(prev => ({ ...prev, type: value }));
                    }
                  }}
                  options={typeOptions}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>

            {/* Right Column - Metadata and Relationships */}
            {task && (
              <div className="col-span-1 space-y-6">
                {/* Metadata Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Metadata
                  </h3>
                  <TaskMetadata
                    task={{
                      ...task,
                      content: formData.content  // Use formData.content to reflect current state
                    }}
                    onUpdate={(updates) => {
                      setFormData(prev => ({
                        ...prev,
                        ...updates,
                        content: {
                          ...prev.content,
                          ...updates.content
                        }
                      }));
                    }}
                  />
                </div>

                {/* Relationships Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Relationships
                  </h3>
                  <TaskRelationships
                    task={task}
                    allTasks={allTasks}
                    onTaskClick={(taskId) => {
                      const targetTask = allTasks.find(t => t.id === taskId);
                      if (targetTask) {
                        onClose();
                        setTimeout(() => {
                          openEditForm(targetTask);
                        }, 100);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 