var t = {}

const getClockId = (name) => { return `${name}-clock`};
const getT = (name) => { return t[getClockId(name)]; }
const setT = (name, time) => {
  t[getClockId(name)] = time;
  setClock(name, time)
}

const setClock = (name, time) => {
  $clock = $('#'+getClockId(name));

  secs = time.get('s');
  if (secs < 10) {
    secs = `0${secs}`;
  }
  $clock.html(`${time.get('m')}:${secs}`);
}

const initClocks = (mins) => {
  $clocks.show();
  tInit = moment.duration(mins, 'm');

  $playerClock.attr('id', getClockId(user.username));
  $opponentClock.attr('id', getClockId(opponent.username));

  setT(user.username, tInit);
  setT(opponent.username, tInit.clone());
}


const tickClock = (name) => {
  var time = getT(name);
  time.subtract(moment.duration(100, 'ms'));
  if (time.as('ms') > 0){
    setT(name, time);
  }else{
    timeLost(name);
  }
}

const timeLost = (name) => {
   if(user.username == name){
     sock.emit('timeLost');
   }
}
