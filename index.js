import { constants } from 'buffer';
import { accessSync, readFile } from 'fs';
import { createServer } from 'http';
import { extname, join, normalize, resolve } from 'path';

const PORT = process.env.PORT || 8080;
const dirName = './public';

const types = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  json: 'application/json',
  xml: 'application/xml',
};

const root = normalize(resolve(dirName));

const server = createServer((req, res) => {
  const fileExt = extname(req.url).slice(1);
  const type = types[fileExt] || types.html;

  // if the url doesn't end with file extension
  let fileName = req.url;
  if (req.url === '/') {
    fileName = 'index.html';
  } else if (!fileExt) {
    try {
      accessSync(join(root, req.url + '.html'), constants.F_OK);
      fileName += '.html';
    } catch (e) {
      fileName = join(fileName, 'index.html');
    }
  }

  const filePath = join(root, fileName);
  // preventing directory traversal attacks by sanitizing the requested path using Path Normalization and Root Directory Verification.
  // so resolving, normalizing and checking if the absolute path is within the root directory
  const isPathUnderRoot = normalize(resolve(filePath)).startsWith(root);
  if (!isPathUnderRoot) {
    serve404();
    return;
  }

  readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        serve404();
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500: Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });

  function serve404() {
    const filePath = join(root, '404.html');
    readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404: Page Not Found :(');
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port: ${PORT}`);
});
