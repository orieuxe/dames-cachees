const clientPath = `${__dirname}/../client`;
const GameState = require(`${clientPath}/commons/GameState`);

class HqGameRoom {
  constructor(s1,s2, id){
    this.initGameRoom(s1,s2, id);

    this.players.forEach((player, idx) => {
      const opponent = this.getOpponent(idx);
      player.on('message', (message) => {
        this.sendToPlayers("message", message);
      })

      player.on('move', (move) => {
        this.playerOnMove = opponent;
        this.sendToPlayer(opponent, 'makeMove', move);
      })

      player.on('putHq', (square) => {
        this.hqs[idx] = square;
        this.checkBothHqChosen();
      })

      player.on('putQ', (move) => {
        this.sendToPlayers("putQ", move);
      })

      player.on('rematch', () => {
        this.rematchOffers[idx] = true;
        this.sendToPlayer(opponent, "event",{
          key : 'rematch.offer.recieved',
          args : {player:player.name}
        });
        this.checkRematchOffers();
      })

      player.on('draw', () => {
        this.drawOffers[idx] = true;
        this.sendToPlayer(opponent, "event",{
          key : 'draw.offer.recieved',
          args : {player:player.name}
        });
        this.checkDrawOffers();
      })

      player.on('resign', () => {
        this.sendToPlayers("resign", opponent.name);
        this.stopClockTimer();
        this.state = GameState.OVER;
      })

      player.on('timeLost', () => {
        this.sendToPlayers('timeWin', opponent.name);
        this.stopClockTimer();
        this.state = GameState.OVER;
      })

      player.on('disconnect', () => {
        this.sendToPlayer(opponent, 'opponentDisconnect', null);
        this.stopClockTimer();
        this.state = GameState.MATCH_OVER;
      })

      player.on('gameInfo', (infos) => {
        this.fen = infos.fen;
        this.state = infos.state;
        if(this.state == GameState.OVER) this.stopClockTimer();
      })
    })
  }

  initGameRoom(s1,s2, id){
    const colors = ['white', 'black'];
    this.id = id;
    this.state = GameState.HQSELECT;
    this.hqs = [null,null];
    this.rematchOffers = [false, false];
    this.drawOffers = [false, false];
    this.players = [s1,s2];
    this.playerOnMove = s1;
    this.clockTimer = null;

    this.players.forEach((p,i) => {
      this.sendToPlayer(p, 'startSelect', {
        color : colors[i],
        id : this.id,
        opponent : this.getOpponent(i).name
      });
    });
  }

  sendToPlayers(key, msg){
    this.players.forEach( p => this.sendToPlayer(p, key, msg));
  }

  sendToPlayer(player, key,msg){
    player.emit(key, msg)
  }

  checkBothHqChosen(){
    if (this.hqs.every(hq => hq !== null)){
      this.hqs.forEach(hq => this.sendToPlayers('putHq',hq));
      this.sendToPlayers("startPlay", null);
      this.runClockTimer();
      this.state = GameState.ONGOING
    }
  }

  checkRematchOffers(){
    if (this.rematchOffers.every(offer => offer)){
      this.initGameRoom(this.players[1],this.players[0], this.id)
    }
  }

  checkDrawOffers(){
    if (this.drawOffers.every(offer => offer)){
      this.sendToPlayers("drawAgreed", null);
    }
    this.state = GameState.OVER;
    this.stopClockTimer();
  }

  getOpponent(idx){
    return this.players[(idx + 1)%2];
  }

  runClockTimer(){
    this.clockTimer = setInterval(() => {
      this.sendToPlayers('tick', this.playerOnMove.name);
    }, 100)
  }

  stopClockTimer(){
    clearInterval(this.clockTimer);
  }
}

module.exports = HqGameRoom;
