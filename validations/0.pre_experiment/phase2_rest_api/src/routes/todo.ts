/**
 * Todo routes - 5 CRUD endpoints
 */

import { Router, Request, Response } from 'express';
import * as todoService from '../services/todo';
import { validateCreateTodo, validateUpdateTodo, validateTodoId } from '../middleware/validation';

const router = Router();

/**
 * GET /todos - Get all todos with optional filtering
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const completed = req.query.completed;
    const filter = completed !== undefined ? { completed: completed === 'true' } : undefined;

    const todos = todoService.getAllTodos(filter);
    res.json(todos);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /todos/:id - Get single todo by ID
 */
router.get('/:id', validateTodoId, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const todo = todoService.getTodoById(id);

    if (!todo) {
      res.status(404).json({
        error: 'Not Found',
        message: `Todo with id ${id} not found`
      });
      return;
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /todos - Create new todo
 */
router.post('/', validateCreateTodo, (req: Request, res: Response) => {
  try {
    const newTodo = todoService.createTodo(req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /todos/:id - Update existing todo
 */
router.put('/:id', validateTodoId, validateUpdateTodo, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedTodo = todoService.updateTodo(id, req.body);

    if (!updatedTodo) {
      res.status(404).json({
        error: 'Not Found',
        message: `Todo with id ${id} not found`
      });
      return;
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /todos/:id - Delete todo
 */
router.delete('/:id', validateTodoId, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = todoService.deleteTodo(id);

    if (!deleted) {
      res.status(404).json({
        error: 'Not Found',
        message: `Todo with id ${id} not found`
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
