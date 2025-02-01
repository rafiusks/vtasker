import { serve } from "https://deno.land/std@0.220.1/http/server.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";

const TASKS_DIR = ".vtask/tasks";

async function loadTasks() {
  const tasks = [];
  try {
    console.log(`Reading tasks from directory: ${await Deno.realPath(TASKS_DIR)}`);
    
    for await (const entry of Deno.readDir(TASKS_DIR)) {
      console.log(`Found file: ${entry.name}`);
      
      if (entry.isFile && entry.name.endsWith('.md')) {
        const filePath = join(TASKS_DIR, entry.name);
        console.log(`Reading task file: ${filePath}`);
        
        const content = await Deno.readTextFile(filePath);
        const [id] = entry.name.split('.');
        const lines = content.split('\n');
        const title = lines[0].replace('# ', '');
        const description = lines.slice(2).join('\n');
        
        tasks.push({
          id,
          title,
          description,
          status: 'backlog',
          priority: 'normal',
          type: 'feature',
          created: new Date().toISOString()
        });
        
        console.log(`Loaded task: ${title}`);
      }
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }
  
  console.log(`Total tasks loaded: ${tasks.length}`);
  return tasks;
}

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  console.log(`Received ${req.method} request to ${url.pathname}`);
  
  if (url.pathname === '/api/tasks') {
    try {
      const tasks = await loadTasks();
      return new Response(JSON.stringify(tasks), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  return new Response('Not Found', { 
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
};

console.log(`Task server running on http://localhost:8000`);
await serve(handler, { port: 8000 });