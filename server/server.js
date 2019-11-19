const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const clientPath = `${__dirname}/../client`;
const io = socketio(server);

app.use(express.static(clientPath));

const HqGameRoom = require('./HqGameRoom');
const waitingRoom = 'waitingRoom';

var updateWaitingList = () => {
  const waitingList = io.sockets.adapter.rooms[waitingRoom]
  if (waitingList !== undefined) {
    const socketIds = Object.keys(waitingList.sockets)
    const clients = socketIds.map(id => {
      return{
        id: id,
        name: io.sockets.connected[id].name
      }
    });
    io.in(waitingRoom).emit('clientsChange', clients);
  }
}

io.on('connection', (sock) => {
  sock.on('disconnect', () => {
    updateWaitingList();
  })

  sock.on('opponentClick', (opponentId) => {
    opponent = io.sockets.connected[opponentId];
    opponent.leave('waitingRoom')
    sock.leave('waitingRoom')
    updateWaitingList();
    new HqGameRoom(sock, opponent);
  })

  sock.on('message', (message) => {
    io.emit('message', message)
  })

  sock.on('clientMessage', (message) => {
    io.emit('clientMessage', message)
  })

  sock.on('clientRegistered', (name) => {
    sock.name = name
    sock.join('waitingRoom');
    updateWaitingList();
  })

});

server.on('error', (err) =>{
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('HQ started on 8080');
});
