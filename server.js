/**
 * Codename Udaan — Node static server for Hostinger
 * Serves the landing page and assets. Listens on process.env.PORT.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'codename-udaan' });
});

app.use(express.static(ROOT, {
  index: 'index.html',
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    }
  }
}));

// SPA / deep-link fallback for hash routes and unknown paths
app.get('*', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Codename Udaan listening on http://0.0.0.0:${PORT}`);
});
