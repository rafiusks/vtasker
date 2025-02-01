export interface TaskContent {
  description: string;
  acceptance_criteria: string[];
  implementation_details?: string;
  notes?: string;
  attachments: string[];
  due_date?: string;
  assignee?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'normal' | 'high';
  type: 'feature' | 'bug' | 'docs' | 'chore';
  labels: string[];
  dependencies: string[];
  parent?: string;
  created_at: string;
  updated_at: string;
  order: number;
  content: TaskContent;
  status_history: Array<{
    from: 'backlog' | 'in-progress' | 'review' | 'done';
    to: 'backlog' | 'in-progress' | 'review' | 'done';
    timestamp: string;
    comment?: string;
  }>;
} 