import { Router, RouterContext } from 'oak';
import type { StorageAdapter, TaskQuery, BoardQuery } from '../types/index.ts';
import { authenticate } from './middleware/auth.ts';
import { validateTaskCreate, validateTaskUpdate, validateTaskQuery, validateBoardCreate, validateBoardUpdate, validateBoardQuery } from './middleware/validation.ts';

export function createApiRouter(storage: StorageAdapter): Router {
  const router = new Router();

  // Task routes
  router.get('/api/tasks', validateTaskQuery, async (ctx: RouterContext) => {
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

  router.get('/api/tasks/:id', async (ctx) => {
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

  router.post('/api/tasks', validateTaskCreate, async (ctx) => {
    try {
      const taskData = ctx.state.validated;
      const now = new Date().toISOString();
      const task = {
        ...taskData,
        id: `task-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
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

  router.put('/api/tasks/:id', validateTaskUpdate, async (ctx) => {
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
      const updatedTask = {
        ...existingTask,
        ...updates,
        id, // Ensure ID doesn't change
        updated_at: new Date().toISOString(),
        // Preserve these fields if not in updates
        created_at: existingTask.created_at,
        labels: updates.labels || existingTask.labels,
        dependencies: updates.dependencies || existingTask.dependencies,
        content: {
          ...existingTask.content,
          ...(updates.content || {}),
        },
      };

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

  router.delete('/api/tasks/:id', authenticate(['admin']), async (ctx) => {
    try {
      const id = ctx.params.id;
      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: 'Task ID is required' };
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
  router.get('/api/boards', authenticate(), validateBoardQuery, async (ctx) => {
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

  router.get('/api/boards/:id', authenticate(), async (ctx) => {
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

  router.post('/api/boards', authenticate(['admin']), validateBoardCreate, async (ctx) => {
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

  router.put('/api/boards/:id', authenticate(['admin']), validateBoardUpdate, async (ctx) => {
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
        updated_at: new Date().toISOString(),
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

  router.delete('/api/boards/:id', authenticate(['admin']), async (ctx) => {
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