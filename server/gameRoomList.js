const clientPath = `${__dirname}/../client`;

const GameState = require(`${clientPath}/commons/GameState.js`);
const HqGameRoom = require('./HqGameRoom');

module.exports = (io) => {
  var gameRoomMap = {}

  const getCurrentGames = () => {
    var currentGames = []
    const gameRoomList = Object.values(gameRoomMap);
    gameRoomList.forEach((gameRoom) => {
      if (gameRoom.state == GameState.MATCH_OVER) {
        delete gameRoomMap[gameRoom.id];
      }else{
        currentGames.push({
          id : gameRoom.id,
          state : gameRoom.state,
          fen : gameRoom.fen,
          white : gameRoom.players[0].name,
          black : gameRoom.players[1].name
        })
      }
    });
    return currentGames
  }

  var list = io.of('/list')
  list.on('connection', (sock) => {
    list.emit('createList', getCurrentGames());
    sock.on('disconnect', () => {
    })
  })

  var live = io.of('/live')
  live.on('connection', (sock) => {
    sock.on('opponentClick', (opponentId) => {
      opponent = live.connected[opponentId];
      const gameRoomId = Object.keys(gameRoomMap).length;
      var gameRoom = new HqGameRoom(sock, opponent, gameRoomId);
      gameRoomMap[gameRoom.id] = gameRoom;
    })

    sock.on('gameInfo', (infos) => {
      list.emit('updateGame', infos)
    })
  });
}
