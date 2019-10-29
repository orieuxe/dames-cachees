class PlayingBoard{
  constructor(fen){
    this.chess = new Chess();
    this.color = boardOrientation.charAt(0);

    sock.on('makeMove', this.makeMove.bind(this));

    var config = {
      draggable: true,
      position: fen,
      onDragStart: this.onDragStart.bind(this),
      onDrop:this.onDrop.bind(this),
      orientation: boardOrientation,
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);
    this.chess.load(fen + " w KQkq - 0 1");
  }

  getPieceTheme(pieceString){
   const defaultPieceDir = 'wikipedia';
   const hiddenQueenDir = 'hidden_queen';
   let pieceDir = defaultPieceDir;

   const piece = {
      color:pieceString[0],
      type:pieceString[1],
    };

   if (piece.type == "H" && piece.color == this.color) {
     pieceDir = hiddenQueenDir;
   }

   return 'img/chesspieces/' + pieceDir + '/' + pieceString +'.png'
  }

  onDragStart (source, piece, position, orientation) {
    // only pick up pieces for the player to move
    if(!piece.includes(this.color)) return false;

    // do not pick up pieces if the this.chess is over
    if (this.chess.game_over()) return false
  }

  onDrop (source, target) {
    // see if the move is legal
    var move = this.chess.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback';


    sock.emit('move', move);
    this.updateBoardPosition();
  }

  updateBoardPosition(){
    this.board.position(this.chess.fen())

    // this.updateStatus();
  }

 updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (this.chess.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (this.chess.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (this.chess.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (this.chess.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  Chatbox.writeEvent(status)
}

  makeMove(move) {
    this.chess.move(move);
    this.updateBoardPosition();
  }
}
