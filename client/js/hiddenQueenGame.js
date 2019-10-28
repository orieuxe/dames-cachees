

//newGame
$( "#startBtn" ).click(function() {
  game.reset();
  // wHiddenQueenSquare = $( "input[name='wh']" ).val();
  // bHiddenQueenSquare = $( "input[name='bh']" ).val();
  wHiddenQueenSquare = "c2"
  bHiddenQueenSquare = "d7"
  
  game.put({ type: game.HIDDEN_QUEEN, color: game.BLACK }, bHiddenQueenSquare)
  onSnapEnd();
  console.log(game.fen())
});
