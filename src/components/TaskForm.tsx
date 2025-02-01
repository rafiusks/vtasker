import type { FC } from 'react'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Select } from './Select'
import type { Task } from '../types'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => void
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

export const TaskForm: FC<TaskFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string[]>(['backlog'])
  const [priority, setPriority] = useState<string[]>(['normal'])
  const [type, setType] = useState<string[]>(['feature'])
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({
      title,
      description,
      status: status[0] as Task['status'],
      priority: priority[0] as Task['priority'],
      type: type[0] as Task['type'],
      labels,
      dependencies: [],
      content: {
        description,
        acceptance_criteria: [],
        notes: '',
        attachments: [],
      },
    })

    // Reset form
    setTitle('')
    setDescription('')
    setStatus(['backlog'])
    setPriority(['normal'])
    setType(['feature'])
    setLabels([])
    setNewLabel('')
    onClose()
  }

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels(prev => [...prev, newLabel.trim()])
      setNewLabel('')
    }
  }

  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  const removeLabel = (label: string) => {
    setLabels(prev => prev.filter(l => l !== label))
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Create New Task
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter task description"
                required
              />
            </div>

            {/* Status, Priority & Type */}
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={setStatus}
                options={statusOptions}
              />
              <Select
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={priorityOptions}
              />
              <Select
                label="Type"
                value={type}
                onChange={setType}
                options={typeOptions}
              />
            </div>

            {/* Labels */}
            <div>
              <label htmlFor="new-label" className="block text-sm font-medium text-gray-700 mb-1">
                Labels
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {labels.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="new-label"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyPress={handleLabelKeyPress}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a label"
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
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
                Create Task
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 