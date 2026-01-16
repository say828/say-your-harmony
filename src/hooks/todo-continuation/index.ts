/**
 * Todo Continuation Enforcer Hook
 *
 * Prevents stopping when incomplete tasks remain in the todo list.
 * Forces the agent to continue until all tasks are marked complete.
 *
 * Ported from oh-my-opencode's todo-continuation-enforcer hook.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Todo {
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string;
  id?: string;
}

export interface IncompleteTodosResult {
  count: number;
  todos: Todo[];
  total: number;
}

export interface TodoContinuationHook {
  checkIncomplete: (sessionId?: string) => Promise<IncompleteTodosResult>;
}

/**
 * Get possible todo file locations
 */
function getTodoFilePaths(sessionId?: string, directory?: string): string[] {
  const claudeDir = join(homedir(), '.claude');
  const paths: string[] = [];

  // Session-specific todos
  if (sessionId) {
    paths.push(join(claudeDir, 'sessions', sessionId, 'todos.json'));
    paths.push(join(claudeDir, 'todos', `${sessionId}.json`));
  }

  // Project-specific todos
  if (directory) {
    paths.push(join(directory, '.harmony', 'todos.json'));
    paths.push(join(directory, '.claude', 'todos.json'));
  }

  // Global todos directory
  const todosDir = join(claudeDir, 'todos');
  if (existsSync(todosDir)) {
    try {
      const files = readdirSync(todosDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          paths.push(join(todosDir, file));
        }
      }
    } catch {
      // Ignore errors reading directory
    }
  }

  return paths;
}

/**
 * Parse todo file content
 */
function parseTodoFile(filePath: string): Todo[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Handle array format
    if (Array.isArray(data)) {
      return data.filter(item =>
        item &&
        typeof item.content === 'string' &&
        typeof item.status === 'string'
      );
    }

    // Handle object format with todos array
    if (data.todos && Array.isArray(data.todos)) {
      return data.todos.filter((item: unknown) => {
        const todo = item as Record<string, unknown>;
        return (
          todo &&
          typeof todo.content === 'string' &&
          typeof todo.status === 'string'
        );
      }) as Todo[];
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Check if a todo is incomplete
 */
function isIncomplete(todo: Todo): boolean {
  return todo.status !== 'completed' && todo.status !== 'cancelled';
}

/**
 * Check for incomplete todos across all possible locations
 */
export async function checkIncompleteTodos(
  sessionId?: string,
  directory?: string
): Promise<IncompleteTodosResult> {
  const paths = getTodoFilePaths(sessionId, directory);
  const seenContents = new Set<string>();
  const allTodos: Todo[] = [];
  const incompleteTodos: Todo[] = [];

  for (const path of paths) {
    if (!existsSync(path)) {
      continue;
    }

    const todos = parseTodoFile(path);

    for (const todo of todos) {
      // Deduplicate by content
      const key = `${todo.content}:${todo.status}`;
      if (seenContents.has(key)) {
        continue;
      }
      seenContents.add(key);

      allTodos.push(todo);

      if (isIncomplete(todo)) {
        incompleteTodos.push(todo);
      }
    }
  }

  return {
    count: incompleteTodos.length,
    todos: incompleteTodos,
    total: allTodos.length
  };
}

/**
 * Create a Todo Continuation hook instance
 */
export function createTodoContinuationHook(directory: string): TodoContinuationHook {
  return {
    checkIncomplete: (sessionId?: string) =>
      checkIncompleteTodos(sessionId, directory)
  };
}

/**
 * Get formatted status string for todos
 */
export function formatTodoStatus(result: IncompleteTodosResult): string {
  if (result.count === 0) {
    return `All tasks complete (${result.total} total)`;
  }

  return `${result.total - result.count}/${result.total} completed, ${result.count} remaining`;
}

/**
 * Get the next pending todo
 */
export function getNextPendingTodo(result: IncompleteTodosResult): Todo | null {
  // First try to find one that's in_progress
  const inProgress = result.todos.find(t => t.status === 'in_progress');
  if (inProgress) {
    return inProgress;
  }

  // Otherwise return first pending
  return result.todos.find(t => t.status === 'pending') ?? null;
}
