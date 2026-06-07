'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import Loader from '@/components/Loader';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

export default function DashboardPage() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Redirect unauthenticated users once auth state has been resolved.
  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/login');
    }
  }, [initializing, user, router]);

  // Debounce the search input so we don't hit the API on every keystroke.
  const debounceRef = useRef();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  const handleCreate = async (fields) => {
    setCreating(true);
    try {
      await api.post('/tasks', fields);
      await fetchTasks();
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (task) => {
    // Optimistic update for snappy UX.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      await fetchTasks();
    } catch {
      fetchTasks();
    }
  };

  const handleUpdate = async (id, fields) => {
    await api.put(`/tasks/${id}`, fields);
    await fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/tasks/${id}`);
    } catch {
      fetchTasks();
    }
  };

  // While resolving auth or redirecting, show a lightweight loader.
  if (initializing || !user) {
    return <Loader label="Loading..." />;
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Your Tasks</h1>
        <p className="text-sm text-slate-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {completedCount} completed
        </p>
      </div>

      <TaskForm onSubmit={handleCreate} submitting={creating} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-64"
        />
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Loader label="Loading tasks..." />
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
