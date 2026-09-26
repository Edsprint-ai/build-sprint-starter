/**
 * Stage 5 and 6: one screen, and something a stranger can run.
 *
 * The trap: nine charts and a filter bar. That is a dashboard, and a dashboard
 * is a way of avoiding the question. One page, one question, click through to
 * the raw evidence.
 */
import express from 'express';
import path from 'node:path';
import { config } from './config.js';

const app = express();
app.use(express.json());
app.use(express.static(path.resolve('public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: config.model,
    aiMode: config.aiMode,
    // Shown on the page on purpose: a squad should be able to see at a glance
    // whether it is currently running with a key or without one.
    hasApiKey: config.hasApiKey,
  });
});

app.get('/api/findings', (_req, res) => {
  // TODO(squad): run the pipeline and return findings plus the unparseable
  // count plus the budget report. All three belong on the screen.
  res.json({ findings: [], unparseable: 0, budget: null });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`\n  http://localhost:${config.port}`);
    console.log(`  model ${config.model}  ·  ai ${config.aiMode}  ·  key ${config.hasApiKey ? 'set' : 'NOT SET'}\n`);
  });
}

export { app };
