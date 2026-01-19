/**
 * Input validation middleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Validate create todo request
 */
export function validateCreateTodo(req: Request, res: Response, next: NextFunction): void {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Title is required and must be a non-empty string'
    });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Description is required and must be a non-empty string'
    });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Title must not exceed 200 characters'
    });
    return;
  }

  if (description.length > 1000) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Description must not exceed 1000 characters'
    });
    return;
  }

  next();
}

/**
 * Validate update todo request
 */
export function validateUpdateTodo(req: Request, res: Response, next: NextFunction): void {
  const { title, description, completed } = req.body;

  // At least one field must be provided
  if (title === undefined && description === undefined && completed === undefined) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'At least one field (title, description, completed) must be provided'
    });
    return;
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Title must be a non-empty string'
      });
      return;
    }
    if (title.length > 200) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Title must not exceed 200 characters'
      });
      return;
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Description must be a non-empty string'
      });
      return;
    }
    if (description.length > 1000) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Description must not exceed 1000 characters'
      });
      return;
    }
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Completed must be a boolean'
    });
    return;
  }

  next();
}

/**
 * Validate todo ID parameter
 */
export function validateTodoId(req: Request, res: Response, next: NextFunction): void {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid todo ID'
    });
    return;
  }

  next();
}
