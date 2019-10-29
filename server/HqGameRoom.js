// const Player = require('./player');

class HqGameRoom {
  constructor(s1,s2, s1IsWhite){
    this.players = [s1,s2]
    this.hqs = [null,null];

    const colors = s1IsWhite ? ['white', 'black'] : ['black', 'white'];
    this.sendColorsToPlayers(colors);

    this.sendToPlayers("message", "Veuillez selectionner votre dame cachée");

    this.players.forEach((player, idx) => {
      const opponent = this.players[(idx + 1)%2];
      player.on('move', (move) => {
        this.sendToPlayer(opponent, 'makeMove', move);
      })

      player.on('putHq', (square) => {
        this.hqs[idx] = square;
        this.checkBothHqChosen();
      })
    })
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
  }
}

module.exports = HqGameRoom;
