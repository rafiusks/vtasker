import type { Task } from '../types';

type TaskStatus = Task['status'];

const statusOrder: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateStatusTransition(from: TaskStatus, to: TaskStatus): ValidationResult {
  const fromIndex = statusOrder.indexOf(from);
  const toIndex = statusOrder.indexOf(to);

  // Can't transition to the same status
  if (from === to) {
    return {
      valid: false,
      error: `Task is already in ${from} status`
    };
  }

  // Can't skip more than one status forward
  if (toIndex - fromIndex > 1) {
    const nextStatus = statusOrder[fromIndex + 1];
    return {
      valid: false,
      error: `Tasks must go through ${nextStatus} before moving to ${to}`
    };
  }

  // Can move backwards freely
  if (toIndex < fromIndex) {
    return { valid: true };
  }

  // Forward transitions are valid if they're to the next status
  return { valid: toIndex - fromIndex === 1 };
}

export function getNextValidStatuses(currentStatus: TaskStatus): TaskStatus[] {
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Can move to the next status or any previous status
  return statusOrder.filter((status, index) => {
    // Allow moving to the next status
    if (index === currentIndex + 1) return true;
    // Allow moving to any previous status
    if (index < currentIndex) return true;
    return false;
  });
}

export function formatStatusTransitionError(from: TaskStatus, to: TaskStatus): string {
  const result = validateStatusTransition(from, to);
  if (result.error) return result.error;

  const validNext = getNextValidStatuses(from);
  return `Invalid status transition. From ${from}, you can move to: ${validNext.join(', ')}`;
} 