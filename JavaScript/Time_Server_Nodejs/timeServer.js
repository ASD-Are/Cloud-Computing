const http = require('http');
const url = require('url');

// Function to add leading zero to numbers less than 10
function zeroFill(i) {
  return (i < 10 ? '0' : '') + i;
}

// Function to format the current date and time
function now() {
  var d = new Date();
  return {
    year: d.getFullYear(),
    month: zeroFill(d.getMonth() + 1),
    date: zeroFill(d.getDate()),
    hour: zeroFill(d.getHours()),
    minute: zeroFill(d.getMinutes())
  };
}

// Create an instance of the HTTP server to handle HTTP requests
let server = http.createServer((req, res) => {
  let result;

  if (req.url === '/api/currenttime') {
    result = now();
  }
  if (result) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result) + '\n');
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start the server listening on the port provided on the command line
server.listen(Number(process.argv[2]), () => {
  console.log('Node server running on http://localhost:' + process.argv[2] + '\n');
});
