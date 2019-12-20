var sock = io('/list')
var boards = {}

const renderGame = (game) => {
  var config = {
    position: game.fen,
  }
  $gameRoom = $gameRoomPrototype.clone();
  $gameRoom.removeAttr('id');
  const boardId = 'game-'+game.id;
  $gameRoom.children('.board').attr('id', boardId);
  $infos = $gameRoom.children('.infos');
  $infos.children('.white').text(game.white);
  $infos.children('.black').text(game.black);
  $gameRoomList.append($gameRoom);
  boards[game.id] = ChessBoard(boardId, config);
}

sock.on('createList', (list) => {
  list.forEach((game) => {
    renderGame(game);
  })
})

sock.on('updateGame', (game) => {
  boards[game.id].position(game.fen);
})
