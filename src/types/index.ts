/**
 * Core type definitions for vTasker
 */

// Task related types
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskType = 'feature' | 'bug' | 'docs' | 'chore';

export interface TaskContent {
  description: string;
  acceptance_criteria: string[];
  implementation_details: string;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  labels: string[];
  dependencies: string[];
  content: TaskContent;
  parent?: string;
  board?: string;
  column?: string;
}

// Board related types
export type BoardType = 'project' | 'team' | 'personal';
export type BoardStatus = 'active' | 'archived';

export interface BoardColumn {
  id: string;
  name: string;
  description?: string;
  limit?: number;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  columns: BoardColumn[];
  created_at: string;
  updated_at: string;
}

export interface BoardQuery {
  name?: string;
}

// AI Integration types
export interface AIMetadata {
  complexity: number;  // 1-10
  required_skills: string[];
  context_needed: 'minimal' | 'moderate' | 'extensive';
  estimated_time: string;  // e.g., "2h", "3d"
  task_nature: string;
  dependencies_graph: string[];
  related_components: string[];
}

export interface AIProgress {
  last_action: string;
  action_type: string;
  action_summary: string;
  next_steps: string[];
  blockers: string[];
  insights: string[];
  timestamp: string;
}

// Query types
export interface TaskQuery {
  status?: string;
  priority?: string;
  type?: string;
  labels?: string[];
  board?: string;
  column?: string;
}

// Storage types
export interface StorageAdapter {
  readTask(id: string): Promise<Task>;
  writeTask(id: string, task: Task): Promise<void>;
  readBoard(id: string): Promise<Board>;
  writeBoard(id: string, board: Board): Promise<void>;
  listTasks(query?: TaskQuery): Promise<Task[]>;
  listBoards(query?: BoardQuery): Promise<Board[]>;
  deleteTask(id: string): Promise<void>;
  deleteBoard(id: string): Promise<void>;
} 