class SelectHqBoard extends AbstractBoard{
  constructor(){
    super();
    this.initSelectBoard();

    sock.on('putHq', this.putHq.bind(this));
  }

  initSelectBoard(){
    this.updateColor();
    var config = {
      draggable: true,
      position: "start",
      onDragStart: this.onHqChoice.bind(this),
      orientation: boardOrientation,
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);
  }

  onHqChoice(square, piece){
    if(piece.includes(this.color) && piece[1] == 'P'){
      sock.emit('putHq', {color:this.color, square:square});
      Chatbox.writeEvent(`Votre dame cachée : ${square}`)
    }else{
      Chatbox.writeEvent("Mauvaise Pièce !")
    }
    return false;
  }

  putHq(hq){
    const piece = hq.color+'H';
    this.board.put(piece, hq.square);
  }
}
