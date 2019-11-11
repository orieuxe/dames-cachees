const sock = io();
var boardOrientation = null;
var board = null;
var player = null;
var $playerList = $("#playerList")
var $msgInput = $("#chat input");
var $msgSend = $("#chat button");

Chatbox.writeEvent('Bienvenue sur Dames Cachées')

const createClient = (color) => {
  $playerList.hide();
  boardOrientation = color;
  player = new Player("timoru");
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
  $playerList.empty();
  clients.forEach((client) => {
    //doesn't show own client
    if (client != sock.id){
      html = `<button id=${client} class="client">${client}</button>`;
      $playerList.append(html);
    }
  })
}

//New match
$playerList.on('click',".client",(event) => {
  let opponentId = event.target.id
  sock.emit('opponentClick', opponentId);
});

//send new chat msg
$msgSend.on('click',() => {
  let msg = $msgInput.val()
  console.log(msg);
  sock.emit('message', msg);
});

//New client / client quitting lobby
sock.on('clientsChange', showClients);
sock.on('message', Chatbox.writeEvent);
sock.on('color', createClient);
sock.on('gameStarts', createGame);
