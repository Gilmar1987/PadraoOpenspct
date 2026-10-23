#!/usr/bin/env node

// Static server for the interface validation smoke test: serves one fixture folder, answers 404 with
// the folder's 404.html when it exists (an empty body otherwise), answers POST /api/cadastro (422 without
// a name), and prints the URL once it listens.
// Usage: node servidor.mjs <folder> <port>

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const [folder, port = '4173'] = process.argv.slice(2);
const root = path.resolve(folder);
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript' };

createServer((request, response) => {
  // A form endpoint: 422 without a name, as a server-side validation would answer.
  if (request.method === 'POST' && request.url === '/api/cadastro') {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      let nome = '';
      try {
        nome = String(JSON.parse(body).nome ?? '').trim();
      } catch {
        nome = '';
      }
      response.writeHead(nome ? 200 : 422, { 'content-type': 'application/json' });
      response.end(JSON.stringify(nome ? { ok: true } : { erro: 'nome obrigatório' }));
    });
    return;
  }
  const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    const notFound = path.join(root, '404.html');
    response.writeHead(404, { 'content-type': types['.html'] });
    response.end(existsSync(notFound) ? readFileSync(notFound) : '');
    return;
  }
  response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(Number(port), '127.0.0.1', () => {
  process.stdout.write(`http://127.0.0.1:${port}/\n`);
});
