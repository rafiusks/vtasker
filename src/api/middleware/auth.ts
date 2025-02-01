import { RouterContext } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import { create, verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Load JWT key
const key = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-512' },
  true,
  ['sign', 'verify'],
);

// User schema
const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'user']),
});

type User = z.infer<typeof userSchema>;

// Create JWT token
export async function createToken(user: User): Promise<string> {
  const payload = {
    iss: 'vtasker',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    user,
  };

  return await create({ alg: 'HS512', typ: 'JWT' }, payload, key);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const payload = await verify(token, key);
    const result = userSchema.safeParse(payload.user);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Authentication middleware
export function authenticate(roles: string[] = []) {
  return async (ctx: RouterContext<string>, next: () => Promise<unknown>) => {
    try {
      const authHeader = ctx.request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        ctx.response.status = 401;
        ctx.response.body = { error: 'Missing or invalid authorization header' };
        return;
      }

      const token = authHeader.substring(7);
      const user = await verifyToken(token);
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { error: 'Invalid token' };
        return;
      }

      if (roles.length && !roles.includes(user.role)) {
        ctx.response.status = 403;
        ctx.response.body = { error: 'Insufficient permissions' };
        return;
      }

      // Store user in context
      ctx.state.user = user;
      await next();
    } catch (error: unknown) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}

// Login handler
export async function login(ctx: RouterContext<string>) {
  try {
    const body = await ctx.request.body().value;
    // In a real app, validate credentials against a database
    // This is just a demo implementation
    const user: User = {
      id: '1',
      username: body.username,
      role: 'user',
    };

    const token = await createToken(user);
    ctx.response.body = { token };
  } catch (error: unknown) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: 'Login error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 