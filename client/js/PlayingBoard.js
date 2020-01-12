class PlayingBoard extends AbstractBoard{
  constructor(fen){
    super();
    this.initBoard(fen);

    sock.on('gameUpdate', this.gameUpdate.bind(this));
    sock.on('putQ', this.putQ.bind(this));
    sock.on('gameOver', this.gameOver.bind(this));
    sock.on('drawAgreed', () => {
      this.setGameOver();
      Chatbox.writeEvent('draw.agreed');
    })
    sock.on('resign', (playerName) => {
      this.setGameOver();
      Chatbox.writeEvent('play.win', {player : playerName, reason : 'play.end-reason.resignation'});
    })
    sock.on('timeWin', (playerName) => {
      this.setGameOver();
      Chatbox.writeEvent('play.win', {player : playerName, reason : 'play.end-reason.time'});
    })
    sock.on('tick', tickClock);
  }

  initBoard(fen){
    super.initBoard();
    var config = {
      draggable: true,
      position: fen,
      onDragStart: this.onDragStart.bind(this),
      onDrop:this.onDrop.bind(this),
      orientation: this.getFullColorName(),
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);

    this.chess = new Chess();
    this.chess.load(fen);
    this.state = GameState.ONGOING;
  }

  onDragStart (source, piece, position, orientation) {
    if(this.isGameOver()) return false;

    // only pick up pieces for the player to move
    if(!piece.includes(color)) return false;
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
    this.board.position(this.chess.fen());
  }

  putQ(move){
    this.chess.put({ type: this.chess.QUEEN, color: move.color }, move.to);
    this.updateBoardPosition();
  }

  gameOver(){
    this.setGameOver();
    var reason = 'unknown-reason';
    if (this.chess.in_checkmate()) {
      reason = 'checkmate';
    }

    if(!this.chess.has_king(this.chess.turn())){
      reason = 'king-capture';
    }

    //get the winning player name.
    let player = ""
    if (this.chess.turn() == color) {
      player = opponent.username
    }else{
      player = user.username
    }
    Chatbox.writeEvent("play.win", {player : player, reason : `play.end-reason.${reason}`});
  }

  gameUpdate(fen) {
    this.chess.load(fen);
    this.updateBoardPosition();
   }
}
