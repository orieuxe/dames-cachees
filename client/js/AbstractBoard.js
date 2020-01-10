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

   setGameOver(){
     this.state = GameState.OVER;
     $rematchBtn.show();
     $resingBtn.hide();
     $drawBtn.hide();
   }

   opponentDisconnect(){
     this.setMatchOver();
     Chatbox.writeEvent('disconnect', {player : opponent.username});
     this.sendGameInfo();
   }

   setMatchOver(){
     this.state = GameState.MATCH_OVER;
     $rematchBtn.remove();
     $resingBtn.remove();
     $drawBtn.remove();
   }

   sendGameInfo(){
     if (this.color == 'w') {
       sock.emit('gameInfo', {
         fen:this.getFen(),
         state:this.state,
         id:gameRoomId,
         white:user.username,
         black:opponent.username
       })
     }
   }

   isGameOver(){
     return (this.state == GameState.OVER || this.state == GameState.MATCH_OVER);
   }
}
