import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath працює також у Node.js 20.0 та на Windows.
const root = dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const publicFiles = new Set(['index.html', 'styles.css', 'app.js', 'content.js']);
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('FORMA: PORT має бути числом від 1 до 65535.'); process.exit(1); }
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Метод не підтримується'); }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || !(publicFiles.has(relative) || (relative.startsWith('assets/') && file.startsWith(resolve(root, 'assets') + sep))) || !types[extname(file)]) {
      res.writeHead(404); return res.end('Сторінку не знайдено');
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'Content-Length': data.length, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Сторінку не знайдено'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `FORMA: порт ${port} зайнятий. Зупиніть інший сервер або задайте PORT.` : `FORMA: не вдалося запустити сервер (${error.code}).`); process.exitCode = 1; });
server.listen(port, '0.0.0.0', () => console.log(`FORMA запущено. Локальна адреса: http://localhost:${port}`));
