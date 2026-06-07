import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All task routes require authentication.
router.use(authenticate);

router.get('/', listTasks);

router.get('/:id', [param('id').isInt().withMessage('Invalid task id.')], validate, getTask);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').optional().trim(),
  ],
  validate,
  addTask
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid task id.'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('description').optional().trim(),
    body('completed').optional().isBoolean().withMessage('completed must be a boolean.'),
  ],
  validate,
  editTask
);

router.delete('/:id', [param('id').isInt().withMessage('Invalid task id.')], validate, removeTask);

export default router;
