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

const getSocketIds = (room) => {
  const list = io.sockets.adapter.rooms[room];
  if (list !== undefined) {
    return Object.keys(list.sockets);
  }
  return [];
}

const isInRoom = (sock, room) =>{
  const socketIds = getSocketIds(room);
  return socketIds.includes(sock.id);
}

const updateWaitingList = () => {
  const socketIds = getSocketIds(waitingRoom);
  const clients = socketIds.map(id => {
    return{
      id: id,
      name: io.sockets.connected[id].name
    }
  });
  io.in(waitingRoom).emit('clientsChange', clients);
}

const broadcastMessage = (message) => {
  io.in(waitingRoom).emit('message', message);
}
const broadcastClientMessage = (clientMessage) => {
  io.in(waitingRoom).emit('clientMessage', clientMessage);
}

io.on('connection', (sock) => {
  sock.on('disconnect', () => {
    updateWaitingList();
  })

  sock.on('clientMessage', broadcastClientMessage);

  sock.on('clientRegistered', (name) => {
    sock.name = name
    sock.join(waitingRoom);
    updateWaitingList();
  })

  sock.on('opponentClick', (opponentId) => {
    //announcing match
    opponent = io.sockets.connected[opponentId];
    broadcastMessage(`nouveau match ${sock.name} vs ${opponent.name}`)

    //leaving waitingRoom
    opponent.leave(waitingRoom)
    sock.leave(waitingRoom)
    sock.off('clientMessage', broadcastClientMessage);
    updateWaitingList();

    //create game room
    new HqGameRoom(sock, opponent);
  })
});

server.on('error', (err) =>{
  console.error('Server error:', err);
});

server.listen(process.env.port || 8080, () => {
  console.log('HQ started on 8080');
});
