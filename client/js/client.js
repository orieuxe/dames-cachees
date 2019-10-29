const sock = io();
var boardOrientation = null;

var board = null;
var player = null;

const createClient = (color) => {
  boardOrientation = color;
  player = new Player("timoru");
  board = new SelectHqBoard();
}

const createGame = (message) => {
  Chatbox.writeEvent(message);
  const fen = board.getFen();
  board.board.clear();
  setTimeout(function () {
    board = new PlayingBoard(fen);
  }, 50);
}

Chatbox.writeEvent('Bienvenue sur Dames Cachées')
sock.on('message', Chatbox.writeEvent);
sock.on('color', createClient);
sock.on('gameStarts', createGame);
