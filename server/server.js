const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const HqGameRoom = require('./HqGameRoom');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

var updateClientList = (namespace) => {
  namespace.clients((error, clients) => {
    if (error) throw error;
    namespace.emit("clientsChange", clients);
  })
}

io.on('connection', (sock) => {
  const lobbyNamespace = io.of('/')
  updateClientList(lobbyNamespace);
  sock.on('disconnect', () => {
    updateClientList(lobbyNamespace);
  })

  sock.on('opponentClick', (opponentId) => {
    opponent = io.sockets.connected[opponentId];
    new HqGameRoom(sock, opponent, true);
  })
});

server.on('error', (err) =>{
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('HQ started on 8080');
});
