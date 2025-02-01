export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'normal' | 'high';
  type: 'feature' | 'bug' | 'docs' | 'chore';
  labels: string[];
  dependencies: string[];
  created_at: string;
  updated_at: string;
  order: number;
  content: {
    description: string;
    acceptance_criteria: string[];
    notes?: string;
    attachments: string[];
  };
} 