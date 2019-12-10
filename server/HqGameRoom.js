const GameState = require('./GameState');

class HqGameRoom {
  constructor(s1,s2){
    this.initGameRoom(s1,s2);

    this.players.forEach((player, idx) => {
      const opponent = this.players[(idx + 1)%2];
      player.on('clientMessage', (message) => {
        this.sendToPlayers("clientMessage", message);
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
        this.sendToPlayer(opponent, "message",`${player.name} veut rejouer !`);
        this.checkRematchOffers();
      })

      player.on('draw', () => {
        this.drawOffers[idx] = true;
        this.sendToPlayer(opponent, "message",`${player.name} propose nulle !`);
        this.checkDrawOffers();
      })

      player.on('resign', () => {
        this.sendToPlayers("resign", player.name);
        this.state = GameState.OVER;
      })
    })
  }

  initGameRoom(s1,s2){
    this.state = GameState.HQSELECT;
    this.hqs = [null,null];
    this.rematchOffers = [false, false];
    this.drawOffers = [false, false];
    this.players = [s1,s2];

    this.sendColorsToPlayers(['white', 'black']);
    this.sendToPlayers("message", "Veuillez selectionner votre dame cachée");
  }

  sendToPlayers(key, msg){
    this.players.forEach( p => this.sendToPlayer(p, key, msg));
  }

  sendToPlayer(player, key,msg){
    player.emit(key, msg)
  }

  sendColorsToPlayers(colors){
    this.players.forEach((p,i) => this.sendToPlayer(p, 'color', colors[i]));
  }

  checkBothHqChosen(){
    if (this.hqs.every(hq => hq !== null)){
      this.hqs.forEach(hq => this.sendToPlayers('putHq',hq));
      this.sendToPlayers("gameStarts", "La partie commence !");
    }
    this.state = GameState.ONGOING
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
}

module.exports = HqGameRoom;
