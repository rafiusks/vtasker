import type { RouterContext } from 'oak';
import type { z } from 'zod';
import { taskSchema, taskUpdateSchema, taskQuerySchema, boardSchema, boardQuerySchema } from '../../schemas/validation.ts';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: z.ZodType, target: ValidationTarget = 'body') {
  return async (ctx: RouterContext<string>, next: () => Promise<unknown>) => {
    try {
      let data: unknown;

      switch (target) {
        case 'body': {
          data = await ctx.request.body().value;
          break;
        }
        case 'query': {
          const searchParams = ctx.request.url.searchParams;
          data = Object.fromEntries(searchParams.entries());
          break;
        }
        case 'params': {
          data = ctx.params;
          break;
        }
      }

      const result = await schema.safeParseAsync(data);
      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: 'Validation error',
          details: result.error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        };
        return;
      }

      // Store validated data for handlers
      ctx.state.validated = result.data;
      await next();
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Validation middleware error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}

// Task validation middleware
export const validateTaskCreate = validate(taskSchema.omit({ id: true }));
export const validateTaskUpdate = validate(taskUpdateSchema);
export const validateTaskQuery = validate(taskQuerySchema, 'query');

// Board validation middleware
export const validateBoardCreate = validate(boardSchema.omit({ id: true }));
export const validateBoardUpdate = validate(boardSchema.omit({ id: true }), 'body');
export const validateBoardQuery = validate(boardQuerySchema, 'query'); 