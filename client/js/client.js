const sock = io();
var boardOrientation = null;
var board = null;
var selectBoard = null;
var playingBoard = null;
var player = null;

Chatbox.writeEvent('Bienvenue sur Dames Cachées')

const createClient = (color) => {
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

const createGame = (message) => {
  const fen = board.getFen();
  board.board.clear();
  $drawBtn.show();
  $resingBtn.show();
  setTimeout(function () {
    Chatbox.writeEvent(message);
    if (playingBoard === null){
      playingBoard = new PlayingBoard(fen);
    }else{
      playingBoard.initPlayingBoard(fen);
    }
    board = playingBoard
  }, 100);
}

const newTestBoard = (colorOrientation) => {
  $login.remove();
  player = new Player(name);
  createClient(colorOrientation);
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
      sock.emit('clientMessage', {
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
  Chatbox.writeEvent("offre de rematch envoyé...")
  sock.emit('rematch');
})

$drawBtn.click((e) => {
  Chatbox.writeEvent("proposition de nulle envoyée...")
  sock.emit('draw');
})

$resingBtn.click((e) => {
  sock.emit('resign');
})

// newTestBoard("white");// manually create a board facing white

//New client / client quitting lobby
sock.on('clientsChange', showClients);
sock.on('message', Chatbox.writeEvent);
sock.on('clientMessage', Chatbox.writeMessage);
sock.on('color', createClient);
sock.on('gameStarts', createGame);
