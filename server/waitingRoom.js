const clientPath = `${__dirname}/../client`;

const constants = require(`${clientPath}/commons/constants.js`);

module.exports = (io) => {
  live = io.of('/live')

  const waitingPlayers = {};
  const waitingRoom = constants.WAITINGROOM;

  if (constants.AUTO_LOGIN) {
    var clientCounter = 0;
  }

  const updateWaitingList = () => {
    const clients = Object.values(waitingPlayers).map((sock) => {
      return {
        id:sock.id,
        name:sock.name
      }
    });

    live.in(waitingRoom).emit('clientsChange', clients);
  }

  const broadcastMessage = (clientMessage) => {
    live.in(waitingRoom).emit('message', clientMessage);
  }

  const registerPlayer = (sock, name) => {
    waitingPlayers[sock.id] = sock;
    sock.name = name
    sock.join(waitingRoom);
    updateWaitingList();
  }

  live.on('connection', (sock) => {
    if (constants.AUTO_LOGIN) {
      registerPlayer(sock, `player${++clientCounter}`);
    }

    sock.on('disconnect', () => {
      if (waitingPlayers.hasOwnProperty(sock.id)){
        delete waitingPlayers[sock.id];
        updateWaitingList();
      }
    });

    sock.on('message', broadcastMessage);

    sock.on('clientRegistered', (name) => {
      registerPlayer(sock, name)
    })

    sock.on('opponentClick', (opponentId) => {
      //announcing match
      const opponent = waitingPlayers[opponentId]
      live.in(waitingRoom).emit('event', {
        key: "new-match",
        args:{
          whitePlayer:sock.name,
          blackPlayer:opponent.name
        }
      });

      //leaving waitingRoom
      delete waitingPlayers[opponentId];
      delete waitingPlayers[sock.id];
      opponent.leave(waitingRoom)
      sock.leave(waitingRoom)
      sock.off('message', broadcastMessage);
      updateWaitingList();
    })
  });
}
