module.exports = (io) => {
  live = io.of('/live')

  const waitingRoom = "waitingRoom";
  const waitingPlayers = {};

  const updateWaitingList = () => {
    const clients = Object.values(waitingPlayers).map((sock) => {
      return {
        id:sock.id,
        name:sock.username
      }
    });
    live.in(waitingRoom).emit('clientsChange', clients);
  }

  const broadcastMessage = (clientMessage) => {
    live.in(waitingRoom).emit('message', clientMessage);
  }

  const registerPlayer = (sock, name) => {
    waitingPlayers[sock.id] = sock;
    sock.username = name
    updateWaitingList();
  }

  live.on('connection', (sock) => {
    sock.on('userInfos', (user) => {
      sock.join(waitingRoom);
      sock.username = user.username;
      updateWaitingList();
    })

    sock.on('disconnect', () => {
      if (waitingPlayers.hasOwnProperty(sock.id)){
        delete waitingPlayers[sock.id];
        updateWaitingList();
      }
    });

    sock.on('leaveWaitingRoom', () => {
      delete waitingPlayers[sock.id];
      updateWaitingList();
    })

    sock.on('message', broadcastMessage);

    sock.on('joinWaitingRoom', (name) => {
      registerPlayer(sock, name)
    })

    sock.on('opponentClick', (opponentId) => {
      //announcing match
      const opponent = waitingPlayers[opponentId]
      live.emit('event', {
        key: "new-match",
        args:{
          whitePlayer:sock.username,
          blackPlayer:opponent.username
        }
      });

      //leaving waitingRoom
      sock.leave(waitingRoom);
      opponent.leave(waitingRoom);
      delete waitingPlayers[opponentId];
      delete waitingPlayers[sock.id];
      sock.off('message', broadcastMessage);
      opponent.off('message', broadcastMessage);
      updateWaitingList();
    })
  });
}
