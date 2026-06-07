'use client';

import { useState } from 'react';
import TaskForm from './TaskForm';

export default function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleUpdate = async (fields) => {
    setBusy(true);
    try {
      await onUpdate(task.id, fields);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li>
        <TaskForm
          initial={task}
          submitting={busy}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <div className="min-w-0 flex-1">
        <h3
          className={`break-words font-medium ${
            task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className={`mt-0.5 break-words text-sm ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
            {task.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              task.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {task.completed ? 'Completed' : 'Pending'}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-2 py-1 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
