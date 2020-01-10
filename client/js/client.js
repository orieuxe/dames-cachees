const sock = io('/live');

sock.on('connect', () => {
  if (user === undefined){
    user = {
      username: "Anon"+sock.id.slice(-4)
    }
  }
  sock.emit('userInfos', user);
});

var boardOrientation = null;
var board = null;
var selectBoard = null;
var playingBoard = null;
var opponent = {};
var gameRoomId = null;

const clientReady = () => {
  const writeEvent = (key) => {
    if(typeof key === 'object'){
      Chatbox.writeEvent(key.key, key.args);
    }else{
      Chatbox.writeEvent(key);
    }
  }

  const startSelect = (infos) => {
    Chatbox.writeEvent('select.start')
    $rematchBtn.hide()
    $waitingRoom.hide();
    boardOrientation = infos.color;
    gameRoomId = infos.id;
    opponent.username = infos.opponent;
    $opponentName.text(opponent.username);
    $playerName.text(user.username);

    initClocks(5);

    if (selectBoard === null){
      selectBoard = new SelectHqBoard();
    }else{
      selectBoard.initBoard();
    }
    board = selectBoard;
    board.sendGameInfo();
  }

  const startPlay = () => {
    const fen = board.getFen();
    if (playingBoard === null){
      playingBoard = new PlayingBoard(fen);
    }else{
      playingBoard.initBoard(fen);
    }
    $drawBtn.show();
    $resingBtn.show();
    board = playingBoard;
    board.sendGameInfo();
    Chatbox.writeEvent('play.start');
  }

  const showClients = (clients) => {
    $waitingRoom.show();
    $playerList.empty();
    clients.forEach((client) => {
      $player = $playerPrototype.clone();
      $player.removeClass('prototype');
      $player.attr('id', client.id);
      $player.text(client.name);
      $playerList.append($player);
      //Can't click if own user
      if (client.name == user.username){
        $playerList.children().last().attr('disabled', true)
      }
    })
  }

  const opponentDisconnect = () => {
    if (board !== null) board.opponentDisconnect();
  }

  //New match
  $playerList.on('click',".player",(event) => {
    let opponentId = event.target.id
    sock.emit('opponentClick', opponentId);
  });

  //send new chat msg
  $msgInput.keypress(function(event) {
      if (event.key === "Enter") {
        let msg = $msgInput.val()
        $msgInput.val('');
        sock.emit('message', {
          author: user.username,
          content:msg
        });
      }
  });

  $JoinWaitingRoom.click(() => {
    sock.emit('joinWaitingRoom', user.username);
    $JoinWaitingRoom.hide();
    $LeaveWaitingRoom.show();
  });

  $LeaveWaitingRoom.click(() => {
    sock.emit('leaveWaitingRoom', name);
    $JoinWaitingRoom.show();
    $LeaveWaitingRoom.hide();
  });

  $rematchBtn.click((e) => {
    Chatbox.writeEvent('rematch.offer.sent')
    sock.emit('rematch');
  })

  $drawBtn.click((e) => {
    Chatbox.writeEvent('draw.offer.sent')
    sock.emit('draw');
  })

  $resingBtn.click((e) => {
    sock.emit('resign');
  })

  //New client / client quitting lobby
  sock.on('clientsChange', showClients);
  sock.on('event', writeEvent);
  sock.on('message', Chatbox.writeMessage);
  sock.on('startSelect', startSelect);
  sock.on('startPlay', startPlay);
  sock.on('opponentDisconnect', opponentDisconnect);
}
