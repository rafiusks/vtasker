import { assertEquals } from 'std/assert/mod.ts';
import { Application } from 'oak';
import { createApiRouter } from './router.ts';
import { FileSystemAdapter } from '../storage/fs-adapter.ts';
import { createToken } from './middleware/auth.ts';
import type { Task, Board } from '../types/index.ts';

const TEST_DIR = '.vtask-test';

// Mock storage adapter
class TestAdapter extends FileSystemAdapter {
  constructor() {
    super(TEST_DIR);
  }

  async setup() {
    try {
      await Deno.mkdir(TEST_DIR, { recursive: true });
      await Deno.mkdir(`${TEST_DIR}/tasks`, { recursive: true });
      await Deno.mkdir(`${TEST_DIR}/boards`, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  override async writeTask(id: string, task: Task): Promise<void> {
    await this.setup(); // Ensure directories exist
    return super.writeTask(id, task);
  }

  override async writeBoard(id: string, board: Board): Promise<void> {
    await this.setup(); // Ensure directories exist
    return super.writeBoard(id, board);
  }

  async cleanup() {
    try {
      await Deno.remove(TEST_DIR, { recursive: true });
    } catch {
      // Directory might not exist
    }
  }
}

// Test utilities
async function makeRequest(app: Application, method: string, path: string, options: RequestInit = {}): Promise<Response> {
  const url = `http://localhost${path}`;
  const request = new Request(url, { method, ...options });
  const response = await app.handle(request);
  if (!response) {
    throw new Error('No response received from application');
  }
  return response;
}

async function createTestApp() {
  const storage = new TestAdapter();
  await storage.setup();
  const router = createApiRouter(storage);
  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  return { app, storage };
}

// Tests
Deno.test('API Router', async (t) => {
  const { app, storage } = await createTestApp();
  const token = await createToken({ id: '1', username: 'test', role: 'admin' });
  const authHeaders = { Authorization: `Bearer ${token}` };

  await t.step('GET /api/tasks - should return empty list initially', async () => {
    const response = await makeRequest(app, 'GET', '/api/tasks', { headers: authHeaders });
    assertEquals(response.status, 200);
    const body = await response.json();
    assertEquals(body, []);
  });

  await t.step('POST /api/tasks - should create a task', async () => {
    const task: Task = {
      id: 'task-001',
      title: 'Test Task',
      status: 'backlog',
      priority: 'normal',
      type: 'feature',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      labels: [],
      dependencies: [],
      content: {
        description: 'Test description',
        acceptance_criteria: [],
        implementation_details: '',
        notes: '',
      },
    };

    const response = await makeRequest(app, 'POST', '/api/tasks', {
      headers: { 
        ...authHeaders, 
        'Content-Type': 'application/json',
        'X-Task-ID': task.id,
      },
      body: JSON.stringify(task),
    });

    assertEquals(response.status, 201);
    const body = await response.json();
    assertEquals(body.id, 'task-001');
  });

  await t.step('GET /api/tasks/:id - should return created task', async () => {
    const response = await makeRequest(app, 'GET', '/api/tasks/task-001', { headers: authHeaders });
    assertEquals(response.status, 200);
    const body = await response.json();
    assertEquals(body.title, 'Test Task');
  });

  await t.step('PUT /api/tasks/:id - should update task', async () => {
    const update = {
      title: 'Updated Task',
      status: 'in-progress',
    };

    const response = await makeRequest(app, 'PUT', '/api/tasks/task-001', {
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    assertEquals(response.status, 200);
    const getResponse = await makeRequest(app, 'GET', '/api/tasks/task-001', { headers: authHeaders });
    const body = await getResponse.json();
    assertEquals(body.title, 'Updated Task');
  });

  await t.step('DELETE /api/tasks/:id - should delete task', async () => {
    const response = await makeRequest(app, 'DELETE', '/api/tasks/task-001', { headers: authHeaders });
    assertEquals(response.status, 204);

    const getResponse = await makeRequest(app, 'GET', '/api/tasks/task-001', { headers: authHeaders });
    assertEquals(getResponse.status, 404);
  });

  // Clean up
  await storage.cleanup();
}); 