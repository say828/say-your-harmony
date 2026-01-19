/**
 * Todo service layer - Business logic with defensive I/O
 */

import { getDatabase } from '../db/database';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from '../types/todo';

/**
 * Convert database row to Todo object
 */
function rowToTodo(row: any): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Get all todos with optional filtering
 */
export function getAllTodos(filter?: TodoFilter): Todo[] {
  try {
    const db = getDatabase();
    let query = 'SELECT * FROM todos';
    const params: any[] = [];

    if (filter?.completed !== undefined) {
      query += ' WHERE completed = ?';
      params.push(filter.completed ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map(rowToTodo);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }
}

/**
 * Get todo by ID
 */
export function getTodoById(id: number): Todo | null {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(id);

    return row ? rowToTodo(row) : null;
  } catch (error) {
    console.error('Error fetching todo:', error);
    throw new Error('Failed to fetch todo');
  }
}

/**
 * Create new todo
 */
export function createTodo(input: CreateTodoInput): Todo {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO todos (title, description)
      VALUES (?, ?)
    `);

    const result = stmt.run(input.title, input.description);
    const newTodo = getTodoById(result.lastInsertRowid as number);

    if (!newTodo) {
      throw new Error('Failed to retrieve created todo');
    }

    return newTodo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }
}

/**
 * Update existing todo
 */
export function updateTodo(id: number, input: UpdateTodoInput): Todo | null {
  try {
    const db = getDatabase();

    // Check if todo exists
    const existing = getTodoById(id);
    if (!existing) {
      return null;
    }

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      params.push(input.description);
    }
    if (input.completed !== undefined) {
      updates.push('completed = ?');
      params.push(input.completed ? 1 : 0);
    }

    // Always update updated_at
    updates.push("updated_at = datetime('now')");
    params.push(id);

    if (updates.length === 1) {
      // Only updated_at changed, return existing
      return existing;
    }

    const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return getTodoById(id);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo');
  }
}

/**
 * Delete todo by ID
 */
export function deleteTodo(id: number): boolean {
  try {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo');
  }
}
