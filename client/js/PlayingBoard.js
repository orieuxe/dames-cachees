class PlayingBoard extends AbstractBoard{
  constructor(fen){
    super();
    this.initBoard(fen);

    sock.on('makeMove', this.makeMove.bind(this));
    sock.on('putQ', this.putQ.bind(this));
    sock.on('drawAgreed', () => {
      this.setGameOver();
      Chatbox.writeEvent('draw.agreed');
      this.sendGameInfo();
    })
    sock.on('resign', (playerName) => {
      this.setGameOver();
      Chatbox.writeEvent('play.win', {player : playerName, reason : 'play.end-reason.resignation'});
      this.sendGameInfo();
    })
    sock.on('timeWin', (playerName) => {
      this.setGameOver();
      Chatbox.writeEvent('play.win', {player : playerName, reason : 'play.end-reason.time'});
      this.sendGameInfo();
    })
  }

  initBoard(fen){
    super.initBoard();
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
    this.state = GameState.ONGOING;
  }

  onDragStart (source, piece, position, orientation) {
    // only pick up pieces for the player to move
    if(!piece.includes(this.color)) return false;

    // do not pick up pieces if the game is over
    if (this.state == GameState.OVER) return false
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

    runClock($opponentClock);
    sock.emit('move', move);
    this.updateBoardPosition();

    if(this.hqHasMovedLikeQ(move)){
      sock.emit('putQ', move);
    }

    this.checkGameOver();
    this.sendGameInfo();
  }

  updateBoardPosition(){
    this.board.position(this.chess.fen());
  }


  hqHasMovedLikeQ(move){
    if (move.piece != this.chess.HIDDEN_QUEEN) return false;
    const colorCoef = (move.color == this.chess.WHITE) ? 1 : -1;
    const start_rank = (move.color == this.chess.WHITE) ? "2" : "7";
    const delta_file = move.to.charCodeAt(0) - move.from.charCodeAt(0)
    const delta_rank = (move.to.charCodeAt(1) - move.from.charCodeAt(1)) * colorCoef
    if (delta_rank == 1){
      if (delta_file == 0 && !move.flags.includes(this.chess.FLAGS.CAPTURE)) return false;
      if ((delta_file == -1 || delta_file == 1) && move.flags.includes(this.chess.FLAGS.CAPTURE)) return false
    }
    if (delta_rank == 2){
      if (delta_file == 0 && move.from[1] == start_rank) return false;
    }
    return true;
  }

  putQ(move){
    this.chess.put({ type: this.chess.QUEEN, color: move.color }, move.to);
    this.chess.load(this.chess.fen());
    this.updateBoardPosition();
    this.sendGameInfo();
  }

  checkGameOver(){
    if( this.chess.game_over()){
      this.setGameOver();
      var reason = 'unknown-reason';
      if (this.chess.in_checkmate()) {
        reason = 'checkmate';
      }

      if(!this.chess.has_king(this.chess.turn())){
        reason = 'king-capture';
      }

      //get the winning player name.
      let moveColor = this.chess.WHITE;
      if (this.chess.turn() === this.chess.WHITE){
        moveColor = this.chess.BLACK
      }
      let movePlayer = player.getName();
      if (moveColor !== this.color) {
        movePlayer = opponent.getName();
      }

      Chatbox.writeEvent("play.win", {player : movePlayer, reason : `play.end-reason.${reason}`});
    }
  }

  setGameOver(){
    this.state = GameState.OVER;
    $rematchBtn.show();
    $resingBtn.hide();
    $drawBtn.hide();
  }

  makeMove(move) {
    this.chess.move(move);
    runClock($playerClock);
    this.updateBoardPosition();
    this.checkGameOver();
    this.sendGameInfo();
   }
}
