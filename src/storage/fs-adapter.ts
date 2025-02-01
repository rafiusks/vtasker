import { join } from 'std/path/mod.ts';
import type { StorageAdapter, Task, Board, TaskQuery, BoardQuery } from '../types/index.ts';
import { markdownToTask, taskToMarkdown } from '../converters/markdown.ts';
import { yamlToBoard, boardToYaml } from '../converters/yaml.ts';

export class FileSystemAdapter implements StorageAdapter {
  private tasksDir: string;
  private boardsDir: string;

  constructor(baseDir: string) {
    this.tasksDir = join(baseDir, 'tasks');
    this.boardsDir = join(baseDir, 'boards');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await Deno.mkdir(this.tasksDir, { recursive: true });
      await Deno.mkdir(this.boardsDir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }

  async readTask(id: string): Promise<Task> {
    const filePath = join(this.tasksDir, `${id}.md`);
    const content = await Deno.readTextFile(filePath);
    return markdownToTask(content, id);
  }

  async writeTask(id: string, task: Task): Promise<void> {
    const filePath = join(this.tasksDir, `${id}.md`);
    const content = taskToMarkdown(task);
    await Deno.writeTextFile(filePath, content);
  }

  async readBoard(id: string): Promise<Board> {
    const filePath = join(this.boardsDir, `${id}.yaml`);
    const content = await Deno.readTextFile(filePath);
    return yamlToBoard(content);
  }

  async writeBoard(id: string, board: Board): Promise<void> {
    const filePath = join(this.boardsDir, `${id}.yaml`);
    const content = boardToYaml(board);
    await Deno.writeTextFile(filePath, content);
  }

  async listTasks(query?: TaskQuery): Promise<Task[]> {
    try {
      const entries: Deno.DirEntry[] = [];
      for await (const entry of Deno.readDir(this.tasksDir)) {
        if (entry.isFile && entry.name.endsWith('.md')) {
          entries.push(entry);
        }
      }

      const tasks = await Promise.all(
        entries.map(async (entry) => {
          try {
            const id = entry.name.replace(/\.md$/, '');
            const content = await Deno.readTextFile(join(this.tasksDir, entry.name));
            return markdownToTask(content, id);
          } catch (error) {
            console.error(`Error reading task ${entry.name}:`, error);
            return null;
          }
        })
      );

      const validTasks = tasks.filter((task): task is Task => task !== null);

      if (!query) return validTasks;

      return validTasks.filter((task) => {
        for (const [key, value] of Object.entries(query)) {
          if (value === undefined) continue;
          
          if (Array.isArray(value)) {
            if (key === 'labels' && !value.every(v => task.labels.includes(v))) {
              return false;
            }
          } else if (task[key as keyof Task] !== value) {
            return false;
          }
        }
        return true;
      });
    } catch (error) {
      console.error('Error listing tasks:', error);
      return [];
    }
  }

  async listBoards(query?: BoardQuery): Promise<Board[]> {
    const entries: Deno.DirEntry[] = [];
    for await (const entry of Deno.readDir(this.boardsDir)) {
      entries.push(entry);
    }

    const boards = await Promise.all(
      entries
        .filter((entry): entry is Deno.DirEntry & { name: string } => 
          entry.isFile && entry.name.endsWith('.yaml'))
        .map(async (entry) => {
          const content = await Deno.readTextFile(join(this.boardsDir, entry.name));
          return yamlToBoard(content);
        })
    );

    if (!query) return boards;

    return boards.filter((board: Board) => {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        if (board[key as keyof Board] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async deleteTask(id: string): Promise<void> {
    const filePath = join(this.tasksDir, `${id}.md`);
    await Deno.remove(filePath);
  }

  async deleteBoard(id: string): Promise<void> {
    const filePath = join(this.boardsDir, `${id}.yaml`);
    await Deno.remove(filePath);
  }
} 