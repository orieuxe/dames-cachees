const clientPath = `${__dirname}/../client`;
const GameState = require(`${clientPath}/commons/GameState`);
const Chess = require(`${clientPath}/lib/myChess`);

class HqGameRoom {
  constructor(s1,s2, id, ioList){
    this.ioList = ioList;
    this.initGameRoom(s1,s2, id);

    this.players.forEach((player, idx) => {
      const opponent = this.getOpponent(idx);
      player.on('message', (message) => {
        this.sendToPlayers("message", message);
      })

      player.on('move', (move) => {
        this.playerOnMove = opponent;
        this.chess.move(move);
        this.sendToPlayer(opponent, 'gameUpdate', this.exportFen(opponent.color));
        this.sendGameIoList();

        if (this.hqHasMovedLikeQ(move)) {
          this.chess.put({ type: this.chess.QUEEN, color: move.color }, move.to);
          this.chess.load(this.chess.fen());
          this.sendToPlayers('putQ', move);
          this.sendGameIoList();
        }

        if (this.chess.game_over()) {
          this.sendToPlayers('gameOver', null);
          this.stopClockTimer();
          this.state = GameState.OVER
        }
      })

      player.on('putHq', (square) => {
        player.hq = square;
        this.checkBothHqChosen();
      })

      player.on('putQ', (move) => {
        this.sendToPlayers("putQ", move);
      })

      player.on('rematch', () => {
        this.rematchOffers[idx] = true;
        this.sendToPlayer(opponent, "event",{
          key : 'rematch.offer.recieved',
          args : {player:player.username}
        });
        this.checkRematchOffers();
      })

      player.on('draw', () => {
        this.drawOffers[idx] = true;
        this.sendToPlayer(opponent, "event",{
          key : 'draw.offer.recieved',
          args : {player:player.username}
        });
        this.checkDrawOffers();
      })

      player.on('resign', () => {
        this.sendToPlayers("resign", opponent.username);
        this.stopClockTimer();
        this.state = GameState.OVER;
      })

      player.on('timeLost', () => {
        this.sendToPlayers('timeWin', opponent.username);
        this.stopClockTimer();
        this.state = GameState.OVER;
      })

      player.on('disconnect', () => {
        this.sendToPlayer(opponent, 'opponentDisconnect', null);
        this.stopClockTimer();
        this.state = GameState.MATCH_OVER;
      })
    })
  }

  initGameRoom(s1,s2, id){
    this.chess = new Chess();
    s1.color = this.chess.WHITE;
    s1.hq = null;
    s2.color = this.chess.BLACK;
    s2.hq = null;
    this.id = id;
    this.state = GameState.HQSELECT;
    this.rematchOffers = [false, false];
    this.drawOffers = [false, false];
    this.players = [s1,s2];
    this.playerOnMove = s1;
    this.clockTimer = null;

    this.players.forEach((p,i) => {
      this.sendToPlayer(p, 'startSelect', {
        color : p.color,
        id : this.id,
        opponent : this.getOpponent(i).username
      });
    });
    this.sendGameIoList();
  }

  sendToPlayers(key, msg){
    this.players.forEach( p => this.sendToPlayer(p, key, msg));
  }

  sendToPlayer(player, key,msg){
    player.emit(key, msg)
  }

  checkBothHqChosen(){
    if (this.players.every(p => p.hq !== null)){
      this.players.forEach(p => {
        this.chess.put({ type: this.chess.HIDDEN_QUEEN, color: p.color }, p.hq);
      })
      this.players.forEach(p => {
        this.sendToPlayer(p, 'startPlay', this.exportFen(p.color))
      });
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
      this.sendToPlayers('tick', this.playerOnMove.username);
    }, 100)
  }

  stopClockTimer(){
    clearInterval(this.clockTimer);
  }

  exportFen(color){
    var fen = this.chess.fen();
    if(color != this.chess.BLACK){
      fen = fen.replace('h', 'p')
    }
    if(color != this.chess.WHITE){
      fen = fen.replace('H', 'P')
    }
    return fen
  }

  hqHasMovedLikeQ(move){
    if (move.piece != this.chess.HIDDEN_QUEEN) return false;
    const colorCoef = (move.color == this.chess.WHITE) ? 1 : -1;
    const start_rank = (move.color == this.chess.WHITE) ? "2" : "7";
    const delta_file = move.to.charCodeAt(0) - move.from.charCodeAt(0)
    const delta_rank = (move.to.charCodeAt(1) - move.from.charCodeAt(1)) * colorCoef
    if (delta_rank == 1){
      if (delta_file == 0 && !move.flags.includes(this.chess.FLAGS.CAPTURE)) return false;
      if ((delta_file == -1 || delta_file == 1) && move.flags.includes(this.chess.FLAGS.CAPTURE)) return false
    }
    if (delta_rank == 2){
      if (delta_file == 0 && move.from[1] == start_rank && !move.flags.includes(this.chess.FLAGS.CAPTURE)) return false;
    }
    return true;
  }

  getGameData(){
    return {
      fen:this.exportFen(null),
      state:this.state,
      id:this.id,
      white:this.players[0].username,
      black:this.players[1].username
    }
  }

  sendGameIoList(){
    this.ioList.emit('updateGame', this.getGameData());
  }
}

module.exports = HqGameRoom;
