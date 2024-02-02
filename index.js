const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const getContentType = (fileExt) => {
  switch (fileExt) {
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    default:
      return 'text/html';
  }
};

const server = http.createServer(async (req, res) => {
  let filePath = path.join(
    __dirname,
    'public',
    req.url === '/' ? 'index.html' : req.url
  );

  const fileExt = path.extname(filePath);
  // if the url doesn't end with file extension, add it
  if (!fileExt) {
    filePath += '.html';
  }

  try {
    let contentType = getContentType(fileExt);
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const notFoundFilePath = path.join(__dirname, 'public', '404.html');
      try {
        const data = await fs.readFile(notFoundFilePath);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error!!!');
      }
    }
  }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port: ${PORT}`);
});
