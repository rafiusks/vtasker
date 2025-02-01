import { Router, RouterContext } from 'oak';
import type { StorageAdapter, TaskQuery, BoardQuery, Task } from '../types/index.ts';
import { authenticate } from './middleware/auth.ts';
import { validateTaskCreate, validateTaskUpdate, validateTaskQuery, validateBoardCreate, validateBoardUpdate, validateBoardQuery } from './middleware/validation.ts';
import { logOperation } from './middleware/logging.ts';
import { validateStatusTransition, formatStatusTransitionError } from '../utils/statusValidation.ts';

// Generate a UUID v4
function generateUUID() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Set version (4) and variant (2)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  // Convert to hex string with proper formatting
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Get current UTC timestamp in ISO format
function getUTCTimestamp() {
  return new Date().toISOString();
}

export function createApiRouter(storage: StorageAdapter): Router {
  const router = new Router();

  // Task routes
  router.get('/api/tasks', validateTaskQuery, logOperation('read'), async (ctx: RouterContext) => {
    try {
      const query = ctx.state.validated as TaskQuery;
      const tasks = await storage.listTasks(query);
      ctx.response.body = tasks;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to list tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.get('/api/tasks/:id', logOperation('read'), async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Task ID is required' };
        return;
      }

      const task = await storage.readTask(id);
      ctx.response.body = task;
    } catch (error: unknown) {
      ctx.response.status = 404;
      ctx.response.body = {
        error: 'Task not found',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.post('/api/tasks', validateTaskCreate, logOperation('create'), async (ctx: RouterContext) => {
    try {
      const taskData = ctx.state.validated;
      const now = getUTCTimestamp();
      const task = {
        ...taskData,
        id: generateUUID(),
        created_at: now,
        updated_at: now,
        order: 0,
      };
      await storage.writeTask(task.id, task);
      ctx.response.status = 201;
      ctx.response.body = task;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to create task',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.put('/api/tasks/:id', validateTaskUpdate, logOperation('update'), async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Task ID is required' };
        return;
      }

      // Get existing task
      const existingTask = await storage.readTask(id);
      
      // Merge updates with existing task
      const updates = ctx.state.validated;
      const now = getUTCTimestamp();

      // Validate status transition if status is being updated
      if (updates.status && updates.status !== existingTask.status) {
        const validationResult = validateStatusTransition(existingTask.status, updates.status);
        if (!validationResult.valid) {
          ctx.response.status = 400;
          ctx.response.body = {
            error: 'Invalid status transition',
            message: validationResult.error || formatStatusTransitionError(existingTask.status, updates.status),
          };
          return;
        }
      }

      // Track status change if status is being updated
      const statusHistory = existingTask.status_history || [];
      if (updates.status && updates.status !== existingTask.status) {
        statusHistory.push({
          from: existingTask.status,
          to: updates.status,
          timestamp: now,
        });
      }

      const updatedTask = {
        ...existingTask,
        ...updates,
        id, // Ensure ID doesn't change
        updated_at: now,
        // Preserve these fields if not in updates
        created_at: existingTask.created_at,
        labels: updates.labels || existingTask.labels,
        dependencies: updates.dependencies || existingTask.dependencies,
        status_history: statusHistory,
        content: {
          ...existingTask.content,
          ...updates.content,
          description: updates.description || existingTask.description,
          due_date: updates.content?.due_date || existingTask.content?.due_date || '',
          assignee: updates.content?.assignee || existingTask.content?.assignee || '',
          acceptance_criteria: updates.content?.acceptance_criteria || existingTask.content?.acceptance_criteria || [],
          implementation_details: updates.content?.implementation_details || existingTask.content?.implementation_details || '',
          notes: updates.content?.notes || existingTask.content?.notes || '',
          attachments: updates.content?.attachments || existingTask.content?.attachments || []
        },
      };

      console.log('Task before update:', existingTask);
      console.log('Update data:', updates);
      console.log('Updated task:', updatedTask);

      await storage.writeTask(id, updatedTask);
      ctx.response.status = 200;
      ctx.response.body = updatedTask;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        ctx.response.status = 404;
        ctx.response.body = {
          error: 'Task not found',
          message: error.message,
        };
      } else {
        ctx.response.status = 500;
        ctx.response.body = {
          error: 'Failed to update task',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  });

  router.delete('/api/tasks/:id', logOperation('delete'), async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Task ID is required' };
        return;
      }

      // Get all tasks to check for references
      const tasks = await storage.listTasks({});
      const referencingTasks = tasks.filter(task => 
        task.dependencies.includes(id) || task.parent === id
      );

      // If there are referencing tasks, return an error
      if (referencingTasks.length > 0) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: 'Task has dependencies',
          message: 'Cannot delete task that is referenced by other tasks',
          details: referencingTasks.map(task => ({
            id: task.id,
            title: task.title,
            type: task.dependencies.includes(id) ? 'dependency' : 'parent'
          }))
        };
        return;
      }

      await storage.deleteTask(id);
      ctx.response.status = 204;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to delete task',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Board routes
  router.get('/api/boards', authenticate(), validateBoardQuery, async (ctx: RouterContext) => {
    try {
      const query = ctx.state.validated as BoardQuery;
      const boards = await storage.listBoards(query);
      ctx.response.body = boards;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to list boards',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.get('/api/boards/:id', authenticate(), async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Board ID is required' };
        return;
      }

      const board = await storage.readBoard(id);
      ctx.response.body = board;
    } catch (error: unknown) {
      ctx.response.status = 404;
      ctx.response.body = {
        error: 'Board not found',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.post('/api/boards', authenticate(['admin']), validateBoardCreate, async (ctx: RouterContext) => {
    try {
      const board = ctx.state.validated;
      await storage.writeBoard(board.id, board);
      ctx.response.status = 201;
      ctx.response.body = board;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to create board',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  router.put('/api/boards/:id', authenticate(['admin']), validateBoardUpdate, async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Board ID is required' };
        return;
      }

      // Get existing board
      const existingBoard = await storage.readBoard(id);
      
      // Merge updates with existing board
      const updates = ctx.state.validated;
      const updatedBoard = {
        ...existingBoard,
        ...updates,
        id, // Ensure ID doesn't change
        updated_at: getUTCTimestamp(),
      };

      await storage.writeBoard(id, updatedBoard);
      ctx.response.body = updatedBoard;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        ctx.response.status = 404;
        ctx.response.body = {
          error: 'Board not found',
          message: error.message,
        };
      } else {
        ctx.response.status = 500;
        ctx.response.body = {
          error: 'Failed to update board',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  });

  router.delete('/api/boards/:id', authenticate(['admin']), async (ctx: RouterContext) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Board ID is required' };
        return;
      }

      await storage.deleteBoard(id);
      ctx.response.status = 204;
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Failed to delete board',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return router;
} 