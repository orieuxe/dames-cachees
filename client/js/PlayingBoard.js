class PlayingBoard extends AbstractBoard{
  constructor(fen){
    super();
    this.initPlayingBoard(fen);

    sock.on('makeMove', this.makeMove.bind(this));
    sock.on('drawAgreed', () => {
      this.isGameOver = true;
      this.sendEndMessage("Partie nulle par accord mutuel !");
    })
    sock.on('resign', (playerName) => {
      this.isGameOver = true;
      this.sendEndMessage(`Partie Terminée, ${playerName} abandonne !`);
    })
  }

  initPlayingBoard(fen){
    this.updateColor();
    var config = {
      draggable: true,
      position: fen,
      onDragStart: this.onDragStart.bind(this),
      onDrop:this.onDrop.bind(this),
      orientation: boardOrientation,
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);

    this.chess = new Chess();
    this.chess.load(fen + " w KQkq - 0 1");
    this.isGameOver = false;
  }

  onDragStart (source, piece, position, orientation) {
    // only pick up pieces for the player to move
    if(!piece.includes(this.color)) return false;

    // do not pick up pieces if the this.chess is over
    if (this.isGameOver) return false
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
    this.checkGameOver();
  }

  updateBoardPosition(){
    this.board.position(this.chess.fen());
  }

  checkGameOver(){
    if( this.chess.game_over()){
      this.isGameOver = true;
      this.sendEndMessage("Partie Terminée !");
    }
  }

  sendEndMessage(message){

    let turn = this.chess.turn();
    let moveColor = "blancs";
    if (turn === 'w'){
      moveColor = "noirs"
    }

    if (this.chess.in_checkmate()) {
      message += ` Les ${moveColor} gagnent par échec et mat`
    }

    if(!this.chess.has_king(turn)){
      message += ` Les ${moveColor} gagnent en prenant le roi !`
    }
    Chatbox.writeEvent(message);
    $rematchBtn.show();
  }

  makeMove(move) {
    this.chess.move(move);
    this.updateBoardPosition();
    this.checkGameOver();
  }
}
