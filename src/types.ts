export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  labels: string[];
  dependencies: string[];
  created_at: string;
  updated_at: string;
  content: {
    notes: string;
    attachments: string[];
  };
} 