class AbstractBoard{
    initBoard(){
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

     if (piece.type == "H") {
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
   }

   setMatchOver(){
     this.state = GameState.MATCH_OVER;
     $rematchBtn.remove();
     $resingBtn.remove();
     $drawBtn.remove();
   }

   isGameOver(){
     return (this.state == GameState.OVER || this.state == GameState.MATCH_OVER);
   }

   getFullColorName(){
     if (color == 'w') return 'white';
     return 'black';
   }
}
