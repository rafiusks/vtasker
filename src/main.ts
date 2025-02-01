import { Application } from 'oak';
import { FileSystemAdapter } from './storage/fs-adapter.ts';
import { createApiRouter } from './api/router.ts';

const app = new Application();
const storage = new FileSystemAdapter('.vtask');

// CORS middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Task-ID'
  );
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status = 204;
    return;
  }
  
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Unhandled error:', err);
    ctx.response.status = 500;
    ctx.response.body = {
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
});

// API routes
const router = createApiRouter(storage);
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const port = parseInt(Deno.env.get('PORT') || '8000');
console.log(`Server running on http://localhost:${port}`);

await app.listen({ port }); 