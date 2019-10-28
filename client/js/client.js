var board = null
var game = null
var player = null

const sock = io();

function onDragStart (source, piece, position, orientation) {
  // only pick up pieces for the player to move
  if(!piece.includes(player.getColor())) return false;

  if(game === null){
    onHqChoice(piece,source)
    return false;
  }

  // do not pick up pieces if the game is over
  if (game.game_over()) return false
}

const writeEvent = (text) => {
  console.log(text);
}

const createClient = (color) => {
  player = new Player("Name", color.charAt(0));
  setUpBoard(color);
}

const setUpBoard = (color) => {
  var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    orientation: color,
    pieceTheme:getPieceTheme,
    // pieceTheme:'img/chesspieces/wikipedia/{piece}.png'
  }
  board = ChessBoard('board', config);
  board.position();
  writeEvent(`Vous avez les ${color}`);
}

const buildPieceFromString = (pieceString) => {
  piece = {
    color:pieceString[0],
    type:pieceString[1],
  }
  return piece;
}

const onHqChoice = (piece, square) => {
  if(piece[1] == 'P'){
    sock.emit('putHq', {color:player.getColor(), square:square});
  }else{
    writeEvent("Mauvaise Pièce !")
  }
}

function getPieceTheme(pieceString){

  defaultPieceDir = 'wikipedia';
  hiddenQueenDir = 'hidden_queen';

  piece = buildPieceFromString(pieceString)
  let pieceDir = defaultPieceDir;
  if (piece.type == "H" && piece.color == player.getColor()){
    pieceDir = hiddenQueenDir;
  }

  return 'img/chesspieces/' + pieceDir + '/' + pieceString +'.png'
}

const createGame = (message) => {
  game = new Chess()
  writeEvent(message);
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback';
  sock.emit('move', move);
  updateBoardPosition();
}

function updateBoardPosition(){
  //castling, en passant, pawn promotion
  board.position(game.fen())
}

const putHq = (hq) => {
  game.put({ type: game.HIDDEN_QUEEN, color: hq.color }, hq.square);
  updateBoardPosition();
}

const makeMove = (move) => {
  game.move(move);
  updateBoardPosition();
}

writeEvent('Bienvenue sur Dames Cachées')
sock.on('message', writeEvent);
sock.on('color', createClient);
sock.on('move', makeMove);
sock.on('putHq', putHq);
sock.on('gameStarts', createGame);
