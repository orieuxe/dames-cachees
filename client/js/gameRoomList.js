var sock = io('/list')
var boards = {}

const renderBoard = (game) => {
  var config = {
    position: game.fen,
  }
  boardId = game.id
  $gameRoomList.append(`<div class="board" id="${boardId}"></div>`)
  boards[boardId] = ChessBoard(boardId, config);
}

sock.on('createList', (list) => {
  list.forEach((game) => {
    renderBoard(game);
  })
})

sock.on('updateGame', (game) => {
  boards[game.id].position(game.fen);
})
