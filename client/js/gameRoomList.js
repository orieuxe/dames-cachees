var sock = io.connect('http://localhost:8080/list')
var boards = []

const GameState = Object.freeze({
    HQSELECT: "hqslect",
    ONGOING:  "ongoing",
    OVER:     "over"
});

const renderBoard = (game, idx) => {
  var config = {
    position: game.fen,
  }
  boardId = `board-${idx}`;
  $gameRoomList.append(`<div class="board" id="${boardId}"></div>`)
  boards.push(ChessBoard(boardId, config));
}

const updateBoard = (game, idx) => {
  boards[idx].position(game.fen);
}

sock.on('createList', (list) => {
  list.forEach((game, i) => {
    renderBoard(game, i);
  })
})

sock.on('updateList', (list) => {
  list.forEach((game, i) => {
    updateBoard(game, i);
  })
})
