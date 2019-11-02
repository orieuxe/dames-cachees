const sock = io();
var boardOrientation = null;
var board = null;
var player = null;

const createClient = (color) => {
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

Chatbox.writeEvent('Bienvenue sur Dames Cachées')
sock.on('message', Chatbox.writeEvent);
sock.on('color', createClient);
sock.on('gameStarts', createGame);

var $playerList = $("#playerList")

const showAllClients = (clients) => {
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

//New client / client quitting lobby
sock.on('clientsChange', showAllClients);
