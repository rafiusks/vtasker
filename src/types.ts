export interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'normal' | 'high'
  type: 'feature' | 'bug' | 'chore' | 'docs'
  created: string
  updated?: string
}