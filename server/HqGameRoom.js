const clientPath = `${__dirname}/../client`;
const GameState = require(`${clientPath}/commons/GameState`);

class HqGameRoom {
  constructor(s1,s2){
    this.initGameRoom(s1,s2);

    this.players.forEach((player, idx) => {
      const opponent = this.getOpponent(idx);
      player.on('message', (message) => {
        this.sendToPlayers("message", message);
      })

      player.on('move', (move) => {
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
        this.sendToPlayer(opponent, "event",`${player.name} veut rejouer !`);
        this.checkRematchOffers();
      })

      player.on('draw', () => {
        this.drawOffers[idx] = true;
        this.sendToPlayer(opponent, "event",`${player.name} propose nulle !`);
        this.checkDrawOffers();
      })

      player.on('resign', () => {
        this.sendToPlayers("resign", player.name);
        this.state = GameState.OVER;
      })

      player.on('disconnect', () => {
        this.sendToPlayer(opponent, "event", `${player.name} a quitté la partie !`)
        this.state = GameState.OVER;
      })

      player.on('gameInfo', (infos) => {
        this.fen = infos.fen;
        this.state = infos.state;
      })
    })
  }

  initGameRoom(s1,s2){
    const colors = ['white', 'black'];
    this.id = s1.id + s2.id;
    this.state = GameState.HQSELECT;
    this.hqs = [null,null];
    this.rematchOffers = [false, false];
    this.drawOffers = [false, false];
    this.players = [s1,s2];

    this.players.forEach((p,i) => {
      this.sendToPlayer(p, 'startSelect', {
        color : colors[i],
        id : this.id,
        opponent : this.getOpponent(i).name
      });
    });
    this.sendToPlayers("event", "Veuillez selectionner votre dame cachée");
  }

  sendToPlayers(key, msg){
    this.players.forEach( p => this.sendToPlayer(p, key, msg));
  }

  sendToPlayer(player, key,msg){
    player.emit(key, msg)
  }

  sendColorsToPlayers(colors){
    this.players.forEach((p,i) => this.sendToPlayer(p, 'startSelect', colors[i]));
  }

  checkBothHqChosen(){
    if (this.hqs.every(hq => hq !== null)){
      this.hqs.forEach(hq => this.sendToPlayers('putHq',hq));
      this.sendToPlayers("startPlay", null);
      this.state = GameState.ONGOING
    }
  }

  checkRematchOffers(){
    if (this.rematchOffers.every(offer => offer)){
      this.initGameRoom(this.players[1],this.players[0])
    }
  }

  checkDrawOffers(){
    if (this.drawOffers.every(offer => offer)){
      this.sendToPlayers("drawAgreed", null);
    }
    this.state = GameState.OVER;
  }

  getOpponent(idx){
    return this.players[(idx + 1)%2];
  }
}

module.exports = HqGameRoom;
