var Games = require('./models/game')

const clientPath = `${__dirname}/../client`;
const GameState = require(`${clientPath}/commons/GameState`);
const Chess = require(`${clientPath}/lib/myChess`);
const ranking  = require('./ranking.js');

class HqGameRoom {
  constructor(s1,s2, id, ioList, timeControl){
    this.ioList = ioList;
    this.id = id;
    this.timeControl = timeControl;

    this.initGameRoom(s1,s2, id, 300);

    this.players.forEach((player, idx) => {
      const opponent = this.getOpponent(idx);
      player.on('message', (message) => {
        this.sendToPlayers("message", message);
      })

      player.on('move', (move) => {
        this.stopClock(player);
        this.runClock(opponent);
        this.chess.move(move);
        this.sendToPlayer(opponent, 'gameUpdate', this.exportFen(opponent.color));
        this.sendGameIoList();

        if(this.hqHasMovedLikeQ(move)) {
          this.chess.put({ type: this.chess.QUEEN, color: move.color }, move.to);
          this.chess.load(this.chess.fen());
          this.sendToPlayers('putQ', move);
          this.sendGameIoList();
        }

        this.checkGameOver();
      })

      player.on('putHq', (square) => {
        player.hq = square;
        this.checkBothHqChosen();
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
        this.result = player.color == this.chess.WHITE ? 0 : 1;
        this.setGameOver();
      })

      player.on('timeLost', () => {
        this.sendToPlayers('timeWin', opponent.username);
        this.result = player.color == this.chess.WHITE ? 0 : 1;
        this.setGameOver();
      })

      player.on('disconnect', () => {
        this.sendToPlayer(opponent, 'opponentDisconnect', null);
        this.result = player.color == this.chess.WHITE ? 0 : 1;
        this.stopClocks();
        this.state = GameState.MATCH_OVER;
      })
    })
  }

  initGameRoom(s1,s2){
    this.chess = new Chess();
    s1.color = this.chess.WHITE;
    s2.color = this.chess.BLACK;
    this.state = GameState.HQSELECT;
    this.rematchOffers = [false, false];
    this.drawOffers = [false, false];
    this.players = [s1,s2];
    this.result = null

    ranking.registerPlayers(s1.username, s2.username, (ratings) => {
      this.sendToPlayers('ratings', ratings);
    });

    this.players.forEach((p,i) => {
      p.hq = null;
      p.clock = this.timeControl * 1000;
      p.timer = null;
      this.sendToPlayer(p, 'startSelect', {
        color : p.color,
        timeControl : this.timeControl,
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
      this.runClock(this.players[0]);
      this.state = GameState.ONGOING
    }
  }

  checkRematchOffers(){
    if (this.rematchOffers.every(offer => offer)){
      this.initGameRoom(this.players[1],this.players[0]);
    }
  }

  checkDrawOffers(){
    if (this.drawOffers.every(offer => offer)){
      this.sendToPlayers("drawAgreed", null);
      this.result = 0.5
      this.setGameOver();
    }
  }

  checkGameOver(){
    if (this.chess.game_over()) {
      var reason = 'unknown-reason';
      if(!this.chess.has_king(this.chess.turn())){
        reason = 'king-capture';
      }else if (this.chess.in_checkmate()) {
        reason = 'checkmate';
      }else if(this.chess.in_stalemate()){
        reason = 'stalemate';
      }else if(this.chess.insufficient_material()){
        reason = 'insufficient-material';
      }else if(this.chess.in_threefold_repetition()){
        reason = 'threefold-rep';
      }

      if (this.chess.in_draw()){
        this.result = 0.5;
      }else{
        this.result = this.chess.WHITE == this.chess.turn() ? 0 : 1;
      }

      this.sendToPlayers('gameOver', reason);
      this.setGameOver();
    }
  }

  getOpponent(idx){
    return this.players[(idx + 1)%2];
  }

  stopClocks(){
    this.players.forEach(p => this.stopClock(p));
  }

  stopClock(p){
    clearInterval(p.timer);
  }

  runClock(p){
    p.timer = setInterval(() => {
      p.clock -= 100;
      this.sendToPlayers('tickClock', {
        player:p.username,
        duration:p.clock
      });
      if (p.clock <= 0) {
        this.setGameOver();
        const winningPlayerIdx = p.color == this.chess.WHITE ? 1 : 0;
        this.sendToPlayers('timeWin', this.players[winningPlayerIdx].username);
      }

    }, 100)
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

  setGameOver(){
    this.stopClocks();
    let ratings = ranking.updateRatings(this.result);
    this.sendToPlayers('ratings', ratings);
    this.state = GameState.OVER;
  }
}

module.exports = HqGameRoom;
