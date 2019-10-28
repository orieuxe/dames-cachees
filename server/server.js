const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const HqGame = require('./hq-game');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

let waitingSocket = null;

io.on('connection', (sock) => {
  if(waitingSocket){
    //start a game
    const waiterIsWhite = true;
    new HqGame(waitingSocket, sock, waiterIsWhite)
    waitingSocket = null;
  }else{
    waitingSocket = sock;
    waitingSocket.emit('message', "En attente d'un adversaire");
  }
})

server.on('error', (err) =>{
  console.error('Server error:', err);
})

server.listen(8080, () => {
  console.log('HQ started on 8080');
});
