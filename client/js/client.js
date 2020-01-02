const sock = io('/live')
var boardOrientation = null;
var board = null;
var selectBoard = null;
var playingBoard = null;
var player = null;
var opponent = null;
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
    initClocks(5);
    $rematchBtn.hide()
    $waitingRoom.hide();
    boardOrientation = infos.color;
    gameRoomId = infos.id;
    opponent = new Player(infos.opponent);
    $opponentName.text(opponent.getName());
    $playerName.text(player.getName());

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
    board.board.clear();
    //delay needed to prevent hq from flickering
    setTimeout(function () {
      if (playingBoard === null){
        playingBoard = new PlayingBoard(fen);
      }else{
        playingBoard.initBoard(fen);
      }
    }, 300);
    $drawBtn.show();
    $resingBtn.show();
    board = playingBoard
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
      if (client.id == sock.id){
        $playerList.children().last().attr('disabled', true)
        //register own player if AUTO_LOGIN enabled
        if (constants.AUTO_LOGIN && player === null){
          player = new Player(client.name)
        }
      }
    })
  }

  const registerPlayer = () => {
    let name = $loginInput.val()
    $login.remove();
    $chat.show();
    player = new Player(name);
    sock.emit('clientRegistered', name);
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
          author: player.getName(),
          content:msg
        });
      }
  });

  //player registered
  $loginInput.keypress(function(event) {
      if (event.key === "Enter") {
        registerPlayer();
      }
  });

  $loginSubmit.click(() => {
    registerPlayer();
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

  if (constants.AUTO_LOGIN) {
    $login.remove();
    $chat.show();
  }

}
