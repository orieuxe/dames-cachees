class SelectHqBoard{
  constructor(){
    this.color = boardOrientation.charAt(0);
    var config = {
      draggable: true,
      position: "start",
      onDragStart: this.onHqChoice.bind(this),
      orientation: boardOrientation,
      pieceTheme:this.getPieceTheme.bind(this),
    }
    this.board = ChessBoard('board', config);

    sock.on('putHq', this.putHq.bind(this));
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

  putHq(hq){
    const piece = hq.color+'H';
    this.board.put(piece, hq.square);
  }

  getFen(){
    return this.board.position('fen');
  }
}
