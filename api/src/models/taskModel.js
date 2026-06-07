import { query } from '../config/db.js';

// Returns tasks for a user with optional status + search filtering, newest first.
export async function getTasks(userId, { status, search } = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (status === 'completed') {
    conditions.push('completed = TRUE');
  } else if (status === 'pending') {
    conditions.push('completed = FALSE');
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  const result = await query(
    `SELECT * FROM tasks WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return result.rows;
}

export async function getTaskById(id, userId) {
  const result = await query(
    `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function createTask(userId, { title, description = '' }) {
  const result = await query(
    `INSERT INTO tasks (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, title, description]
  );
  return result.rows[0];
}

// Partial update: only provided fields are changed.
export async function updateTask(id, userId, fields) {
  const allowed = ['title', 'description', 'completed'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }

  if (sets.length === 0) {
    return getTaskById(id, userId);
  }

  sets.push(`updated_at = NOW()`);
  params.push(id, userId);

  const result = await query(
    `UPDATE tasks SET ${sets.join(', ')}
     WHERE id = $${params.length - 1} AND user_id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function deleteTask(id, userId) {
  const result = await query(
    `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0];
}
