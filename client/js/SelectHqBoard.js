class SelectHqBoard extends AbstractBoard{
  constructor(){
    super();
    this.initBoard();
  }

  initBoard(){
    super.initBoard();
    var config = {
      draggable: true,
      position: 'start',
      onDragStart: this.onHqChoice.bind(this),
      orientation: this.getFullColorName(),
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);
    this.state = GameState.HQSELECT;
  }

  onHqChoice(square, piece){
    if(this.isGameOver()) return false;

    if(piece.includes(color) && piece[1] == 'P'){
      sock.emit('putHq', square);
      Chatbox.writeEvent('select.hq', {square:square});
    }else{
      Chatbox.writeEvent('select.wrong-piece');
    }
    return false;
  }
}
