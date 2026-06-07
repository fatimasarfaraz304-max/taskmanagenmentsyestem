import app from './app.js';
import { initDb } from './config/initDb.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Retry DB init briefly so the API can start before Postgres is fully ready.
    await waitForDb();
    await initDb();

    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

async function waitForDb(retries = 10, delayMs = 2000) {
  const { query } = await import('./config/db.js');
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await query('SELECT 1');
      return;
    } catch (err) {
      console.log(`Waiting for database (attempt ${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Could not connect to the database.');
}

start();
