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

const initClocks = (secs) => {
  $clocks.show();
  tInit = moment.duration(secs, 's');

  $playerClock.attr('id', getClockId(user.username));
  $opponentClock.attr('id', getClockId(opponent.username));

  setT(user.username, tInit);
  setT(opponent.username, tInit.clone());
}


const tickClock = (clock) => {
  setT(clock.player, moment.duration(clock.duration, 'ms'));
}
