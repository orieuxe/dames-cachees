const clientPath = `${__dirname}/../client`;

const constants = require(`${clientPath}/commons/constants.js`);
const GameState = require(`${clientPath}/commons/GameState.js`);
const HqGameRoom = require('./HqGameRoom');

module.exports = (io) => {
  var gameRoomMap = {}

  const getCurrentGames = () => {
    var currentGames = []
    const gameRoomList = Object.values(gameRoomMap);
    gameRoomList.forEach((gameRoom) => {
      if (gameRoom.state == GameState.OVER) {
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
      
      var gameRoom = new HqGameRoom(sock, opponent, gameRoomMap.length);
      gameRoomMap[gameRoom.id] = gameRoom;
    })

    sock.on('gameInfo', (infos) => {
      list.emit('updateGame', infos)
    })
  });
}
