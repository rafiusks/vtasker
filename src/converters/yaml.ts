import { parse as parseYaml, stringify as stringifyYaml } from 'std/yaml/mod.ts';
import type { Board, BoardColumn } from '../types/index.ts';

export function yamlToBoard(yaml: string): Board {
  const data = parseYaml(yaml) as Board;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    columns: data.columns.map((column: BoardColumn) => ({
      id: column.id,
      name: column.name,
      description: column.description,
      limit: column.limit,
    })),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export function boardToYaml(board: Board): string {
  // Convert Board to a plain object to ensure it matches Record<string, unknown>
  const plainBoard = {
    id: board.id,
    name: board.name,
    description: board.description,
    columns: board.columns.map(column => ({
      id: column.id,
      name: column.name,
      description: column.description,
      limit: column.limit,
    })),
    created_at: board.created_at,
    updated_at: board.updated_at,
  };
  return stringifyYaml(plainBoard);
} 