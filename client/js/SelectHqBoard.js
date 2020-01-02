class SelectHqBoard extends AbstractBoard{
  constructor(){
    super();
    this.initBoard();

    sock.on('putHq', this.putHq.bind(this));
    sock.on('opponentDisconnect', () => {
      this.setMatchOver();
      Chatbox.writeEvent('disconnect', {player : opponent.getName()});
      this.sendGameInfo();
    })
  }

  initBoard(){
    super.initBoard();
    var config = {
      draggable: true,
      position: 'rnbqkbnr/pppppppp/6hH/8/8/8/PPPPPPPP/RNBQKBNR',
      onDragStart: this.onHqChoice.bind(this),
      orientation: boardOrientation,
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);
    this.board.position('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    this.state = GameState.HQSELECT;
  }

  onHqChoice(square, piece){
    if(this.isGameOver()) return false;
    if(piece.includes(this.color) && piece[1] == 'P'){
      sock.emit('putHq', {color:this.color, square:square});
      Chatbox.writeEvent('select.hq', {square:square});
    }else{
      Chatbox.writeEvent('select.wrong-piece');
    }
    return false;
  }

  putHq(hq){
    const piece = hq.color+'H';
    this.board.put(piece, hq.square);
  }
}
