import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../models/taskModel.js';

export async function listTasks(req, res, next) {
  try {
    const { status, search } = req.query;
    const tasks = await getTasks(req.user.id, { status, search });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await getTaskById(req.params.id, req.user.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function addTask(req, res, next) {
  try {
    const { title, description } = req.body;
    const task = await createTask(req.user.id, { title, description });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function editTask(req, res, next) {
  try {
    const existing = await getTaskById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, completed } = req.body;
    const task = await updateTask(req.params.id, req.user.id, { title, description, completed });
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function removeTask(req, res, next) {
  try {
    const deleted = await deleteTask(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task deleted.', id: deleted.id });
  } catch (err) {
    next(err);
  }
}
