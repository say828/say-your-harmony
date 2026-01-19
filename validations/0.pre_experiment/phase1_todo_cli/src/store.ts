import * as fs from 'fs';
import * as path from 'path';

export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface TodoStore {
  tasks: Task[];
  nextId: number;
}

const TODO_FILE = path.join(process.cwd(), 'todos.json');

function initStore(): TodoStore {
  return {
    tasks: [],
    nextId: 1
  };
}

export function loadStore(): TodoStore {
  try {
    if (!fs.existsSync(TODO_FILE)) {
      const store = initStore();
      saveStore(store);
      return store;
    }
    const data = fs.readFileSync(TODO_FILE, 'utf-8');
    return JSON.parse(data) as TodoStore;
  } catch (error) {
    console.error('Error loading store, creating new one');
    const store = initStore();
    saveStore(store);
    return store;
  }
}

export function saveStore(store: TodoStore): void {
  try {
    fs.writeFileSync(TODO_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving store:', error);
    throw error;
  }
}

export function addTask(text: string): Task {
  const store = loadStore();
  const task: Task = {
    id: store.nextId,
    text,
    done: false,
    createdAt: new Date().toISOString()
  };
  store.tasks.push(task);
  store.nextId++;
  saveStore(store);
  return task;
}

export function listTasks(): Task[] {
  const store = loadStore();
  return store.tasks;
}

export function markTaskDone(id: number): Task | null {
  const store = loadStore();
  const task = store.tasks.find(t => t.id === id);
  if (!task) {
    return null;
  }
  task.done = true;
  saveStore(store);
  return task;
}

export function deleteTask(id: number): boolean {
  const store = loadStore();
  const initialLength = store.tasks.length;
  store.tasks = store.tasks.filter(t => t.id !== id);
  if (store.tasks.length === initialLength) {
    return false;
  }
  saveStore(store);
  return true;
}
