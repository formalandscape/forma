import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep) || !['.html', '.css', '.js', '.svg'].includes(extname(path))) { res.writeHead(404); return res.end('Not found'); }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)], 'X-Content-Type-Options': 'nosniff' }); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log('Зелена Форма: порт ' + (process.env.PORT || 3000)));
