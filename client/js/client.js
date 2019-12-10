const sock = io();
var boardOrientation = null;
var board = null;
var selectBoard = null;
var playingBoard = null;
var player = null;

Chatbox.writeEvent('Bienvenue sur Dames Cachées')

const startSelect = (color) => {
  $rematchBtn.hide();
  $waitingRoom.hide();
  boardOrientation = color;
  if (selectBoard === null){
    selectBoard = new SelectHqBoard();
  }else{
    selectBoard.initSelectBoard();
  }
  board = selectBoard;
}

const startPlay = () => {
  const fen = board.getFen();
  board.board.clear();
  $drawBtn.show();
  $resingBtn.show();
  setTimeout(function () {
    Chatbox.writeEvent("La partie commence !");
    if (playingBoard === null){
      playingBoard = new PlayingBoard(fen);
    }else{
      playingBoard.initPlayingBoard(fen);
    }
    board = playingBoard
  }, 100);
}

//client automatically logs in
const autoLogin = () => {
  $login.remove();
  const name = `player`
  player = new Player(name);
  sock.emit('clientRegistered', name);
}

const showClients = (clients) => {
  $waitingRoom.show();
  $playerList.empty();
  clients.forEach((client) => {
    html = `<button id=${client.id} class="client">${client.name}</button>`;
    $playerList.append(html);
    //Can't click if own user
    if (client.id == sock.id){
      $playerList.children().last().attr('disabled', true)
    }
  })
}

//New match
$playerList.on('click',".client",(event) => {
  let opponentId = event.target.id
  sock.emit('opponentClick', opponentId);
});

//send new chat msg
$msgInput.keypress(function(event) {
    if (event.key === "Enter") {
      let msg = $msgInput.val()
      $msgInput.val('');
      sock.emit('message', {
        author: player.getName(),
        content:msg
      });
    }
});

//player registered
$playerName.keypress(function(event) {
    if (event.key === "Enter") {
      let name = $playerName.val()
      $login.remove();
      player = new Player(name);
      sock.emit('clientRegistered', name);
    }
});

$rematchBtn.click((e) => {
  Chatbox.writeEvent("Offre de rematch envoyée...")
  sock.emit('rematch');
})

$drawBtn.click((e) => {
  Chatbox.writeEvent("Proposition de nulle envoyée...")
  sock.emit('draw');
})

$resingBtn.click((e) => {
  sock.emit('resign');
})


//New client / client quitting lobby
sock.on('clientsChange', showClients);
sock.on('event', Chatbox.writeEvent);
sock.on('message', Chatbox.writeMessage);
sock.on('startSelect', startSelect);
sock.on('startPlay', startPlay);


// autoLogin(); //uncomment this for faster testing
