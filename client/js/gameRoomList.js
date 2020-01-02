var sock = io('/list')
var boards = {}

const getGameRoomId = (gameId) => { return 'game-room'+gameId; }
const getBoardId = (gameId) => { return 'board'+gameId; }

const renderGame = (game) => {
  var config = {
    position: game.fen,
  }
  $gameRoom = $gameRoomPrototype.clone();
  $gameRoom.removeClass('prototype');
  $gameRoom.attr('id', getGameRoomId(game.id));
  $gameRoom.children('.board').attr('id', getBoardId(game.id));
  $gameRoomList.append($gameRoom);
  boards[game.id] = ChessBoard(getBoardId(game.id), config);
  setInfos(game);
}

const setInfos = (game) => {
  $gameRoom = $('#'+getGameRoomId(game.id));
  $infos = $gameRoom.children('.infos');
  $infos.children('.white').text(game.white);
  $infos.children('.black').text(game.black);
}

sock.on('createList', (list) => {
  if (list.length > 0) {
    $noGameMsg.hide();
    list.forEach((game) => {
      renderGame(game);
    })
  }
})

sock.on('updateGame', (game) => {
  if (boards.hasOwnProperty(game.id)) {
    boards[game.id].position(game.fen);
    setInfos(game);
  }else{
    $noGameMsg.hide();
    renderGame(game);
  }
})
