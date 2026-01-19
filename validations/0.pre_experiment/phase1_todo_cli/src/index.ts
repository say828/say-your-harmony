#!/usr/bin/env node

import { addTask, listTasks, markTaskDone, deleteTask } from './store.js';

function printUsage(): void {
  console.log(`
Todo CLI - Usage:
  add <text>      Add a new todo
  list            List all todos
  done <id>       Mark a todo as done
  delete <id>     Delete a todo

Examples:
  node dist/index.js add "Buy groceries"
  node dist/index.js list
  node dist/index.js done 1
  node dist/index.js delete 1
  `);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case 'add': {
      const text = args.slice(1).join(' ');
      if (!text.trim()) {
        console.error('Error: Todo text cannot be empty');
        console.log('Usage: add <text>');
        process.exit(1);
      }
      const task = addTask(text);
      console.log(`Added task #${task.id}: ${task.text}`);
      break;
    }

    case 'list': {
      const tasks = listTasks();
      if (tasks.length === 0) {
        console.log('No todos yet. Add one with: add <text>');
      } else {
        console.log('\nTodos:');
        tasks.forEach(task => {
          const status = task.done ? '[x]' : '[ ]';
          console.log(`  ${status} #${task.id}: ${task.text}`);
        });
        console.log('');
      }
      break;
    }

    case 'done': {
      const idStr = args[1];
      if (!idStr) {
        console.error('Error: Task ID is required');
        console.log('Usage: done <id>');
        process.exit(1);
      }
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        console.error('Error: Task ID must be a number');
        process.exit(1);
      }
      const task = markTaskDone(id);
      if (!task) {
        console.error(`Error: Task #${id} not found`);
        process.exit(1);
      }
      console.log(`Marked task #${task.id} as done: ${task.text}`);
      break;
    }

    case 'delete': {
      const idStr = args[1];
      if (!idStr) {
        console.error('Error: Task ID is required');
        console.log('Usage: delete <id>');
        process.exit(1);
      }
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        console.error('Error: Task ID must be a number');
        process.exit(1);
      }
      const success = deleteTask(id);
      if (!success) {
        console.error(`Error: Task #${id} not found`);
        process.exit(1);
      }
      console.log(`Deleted task #${id}`);
      break;
    }

    default:
      console.error(`Error: Unknown command "${command}"`);
      printUsage();
      process.exit(1);
  }
}

main();
