import { Context } from 'oak';
import { Task } from '../../types.ts';

type OperationType = 'create' | 'read' | 'update' | 'delete';
type LogEntry = {
  timestamp: string;
  operation: OperationType;
  taskId?: string;
  status: number;
  error?: string;
};

const logs: LogEntry[] = [];

export function logOperation(operation: OperationType) {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const startTime = Date.now();
    let taskId: string | undefined;

    try {
      // Extract task ID from various sources
      taskId = ctx.params?.id || 
        (ctx.request.method === 'POST' ? 'new-task' : undefined);

      // Call the next middleware/handler
      await next();

      // Log successful operation
      logs.push({
        timestamp: new Date().toISOString(),
        operation,
        taskId,
        status: ctx.response.status,
      });

    } catch (error) {
      // Log failed operation
      logs.push({
        timestamp: new Date().toISOString(),
        operation,
        taskId,
        status: ctx.response.status || 500,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs(): void {
  logs.length = 0;
} 