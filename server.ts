import { Application, Context } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import { FileSystemAdapter } from './src/storage/fs-adapter.ts';
import { createApiRouter } from './src/api/router.ts';

const storage = new FileSystemAdapter('.vtask');
const app = new Application();
const router = createApiRouter(storage);

// CORS middleware
app.use(async (ctx: Context, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  await next();
});

// Error handling middleware
app.use(async (ctx: Context, next) => {
  try {
    await next();
  } catch (err: unknown) {
    ctx.response.status = 500;
    ctx.response.body = { error: err instanceof Error ? err.message : 'Unknown error' };
    console.error('Error handling request:', err);
  }
});

// Use the router
app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server running on http://localhost:8000');
await app.listen({ port: 8000 });