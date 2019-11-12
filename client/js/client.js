const sock = io();
var boardOrientation = null;
var board = null;
var player = null;
var $waitingRoom = $("#waitingRoom");
var $playerList = $("#playerList");
var $msgInput = $("#chat-input");
var $login = $("#login");
var $playerName = $("#playerName");

Chatbox.writeEvent('Bienvenue sur Dames Cachées')

const createClient = (color) => {
  $waitingRoom.hide();
  boardOrientation = color;
  board = new SelectHqBoard();
}

const createGame = (message) => {
  const fen = board.getFen();
  board.board.clear();
  setTimeout(function () {
    Chatbox.writeEvent(message);
    board = new PlayingBoard(fen);
  }, 100);
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

//New client / client quitting lobby
sock.on('clientsChange', showClients);
sock.on('message', Chatbox.writeEvent);
sock.on('clientMessage', Chatbox.writeMessage);
sock.on('color', createClient);
sock.on('gameStarts', createGame);
