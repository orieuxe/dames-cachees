const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


const clientPath = `${__dirname}/../client`;
const constants = require(`${clientPath}/commons/constants.js`);
const HqGameRoom = require('./HqGameRoom');

app.use(express.static(clientPath));
const waitingRoom = constants.WAITINGROOM;

var gameRoomList = [];
if (constants.AUTO_LOGIN){
  var clientCounter = 0;
}

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

const broadcastEvent = (message) => {
  io.in(waitingRoom).emit('event', message);
}
const broadcastMessage = (clientMessage) => {
  io.in(waitingRoom).emit('message', clientMessage);
}

const getCurrentGames = () => {
  var currentGames = []
  gameRoomList.forEach((gameRoom) => {
    currentGames.push({
      id : gameRoom.id,
      state : Object(gameRoom.state),
      fen : gameRoom.fen,
      white : gameRoom.players[0].name,
      black : gameRoom.players[1].name
    })
  });
  return currentGames
}

const registerPlayer = (sock, name) => {
  sock.name = name
  sock.join(waitingRoom);
  updateWaitingList();
}

var list = io.of('/list')
list.on('connection', (sock) => {
  list.emit('createList', getCurrentGames());
  sock.on('disconnect', () => {
    // console.log("disconnnection" + sock.id);
  })
})

var index = io.of('/')
index.on('connection', (sock) => {
  if (constants.AUTO_LOGIN) {
    registerPlayer(sock, `player${++clientCounter}`);
  }

  sock.on('disconnect', () => {
    updateWaitingList();
  })

  sock.on('message', broadcastMessage);

  sock.on('clientRegistered', (name) => {registerPlayer(sock, name)})

  sock.on('opponentClick', (opponentId) => {
    //announcing match
    opponent = io.sockets.connected[opponentId];
    broadcastEvent(`Nouveau match ${sock.name} vs ${opponent.name}`)

    //leaving waitingRoom
    opponent.leave(waitingRoom)
    sock.leave(waitingRoom)
    sock.off('message', broadcastMessage);
    updateWaitingList();

    //create game room
    var gameRoom = new HqGameRoom(sock, opponent, gameRoomList.length);
    gameRoomList.push(gameRoom);
  })

  sock.on('gameInfo', (infos) => {
    list.emit('updateGame', infos)
  })
});

server.on('error', (err) =>{
  console.error('Server error:', err);
});

server.listen(process.env.PORT || constants.LOCALHOSTPORT, () => {
  console.log(`HQ started on ${constants.LOCALHOSTPORT}`);
});
