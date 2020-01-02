class AbstractBoard{
    initBoard(){
      this.color = boardOrientation.charAt(0);
      this.state = null;
    }

    getFen(){
      return this.board.position('fen');
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

   sendGameInfo(){
     if (this.color == 'w') {
       sock.emit('gameInfo', {
         fen:this.getFen(),
         state:this.state,
         id:gameRoomId,
         white:player.getName(),
         black:opponent.getName()
       })
     }
   }
}
