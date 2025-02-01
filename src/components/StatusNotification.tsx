import React, { useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import type { Task } from '../types';

interface StatusNotificationProps {
  show: boolean;
  onClose: () => void;
  taskTitle: string;
  fromStatus?: Task['status'];
  toStatus?: Task['status'];
}

const formatStatus = (status?: Task['status']): string => {
  if (!status) return 'Unknown';
  switch (status) {
    case 'backlog': return 'Backlog';
    case 'in-progress': return 'In Progress';
    case 'review': return 'Review';
    case 'done': return 'Done';
    default: return 'Unknown';
  }
};

const getStatusIcon = (status?: Task['status']): string => {
  if (!status) return '❓';
  switch (status) {
    case 'backlog': return '📥';
    case 'in-progress': return '🏃';
    case 'review': return '👀';
    case 'done': return '✅';
    default: return '❓';
  }
};

const getStatusColor = (status?: Task['status']): { bg: string, text: string } => {
  if (!status) return { bg: 'bg-gray-100', text: 'text-gray-700' };
  switch (status) {
    case 'backlog':
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    case 'in-progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'review':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'done':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

export function StatusNotification({ 
  show, 
  onClose, 
  taskTitle = '', 
  fromStatus = 'backlog', 
  toStatus = 'backlog' 
}: StatusNotificationProps) {
  // Auto-hide after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const fromColors = getStatusColor(fromStatus);
  const toColors = getStatusColor(toStatus);

  if (!show) return null;

  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-0 z-50 flex px-4 py-6 sm:p-6">
      <div className="ml-auto flex w-full flex-col items-end space-y-4 sm:w-96">
        <Transition
          show={true}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center text-xl">
                    {getStatusIcon(toStatus)}
                  </span>
                </div>
                <div className="ml-3 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 mb-1 truncate pr-8">
                    {taskTitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${fromColors.bg} ${fromColors.text}`}>
                      {getStatusIcon(fromStatus)} {formatStatus(fromStatus)}
                    </span>
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${toColors.bg} ${toColors.text}`}>
                      {getStatusIcon(toStatus)} {formatStatus(toStatus)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
} 