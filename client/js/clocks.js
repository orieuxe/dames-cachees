var t = {}

const getT = ($clock) => { return t[$clock.attr('id')]; }
const setT = ($clock, time) => { t[$clock.attr('id')] = time; }

const initClocks = (mins) => {
  $clocks.show();
  tInit = moment.duration(mins, 'seconds');
  setT($playerClock, tInit);
  setT($opponentClock, tInit.clone());

  setClock($playerClock, tInit);
  setClock($opponentClock, tInit);
}

const setClock = ($clock, time) => {
  secs = time.get('seconds');
  if (secs < 10) {
    secs = `0${secs}`;
  }
  $clock.html(`${time.get('minutes')}:${secs}`);
}

timer = null
const runClock = ($clock) => {
  if (timer !== null) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    tClock = getT($clock);
    tClock.subtract(moment.duration(1, 's'));
    if (tClock.as('seconds') >= 0){
      setClock($clock, tClock);
    }else{
      timeLost($clock);
      clearInterval(timer);
    }
  }, 1000)
}

const timeLost = ($clock) => {
   if($clock.attr('id') == $playerClock.attr('id')){
     sock.emit('timeLost', null);
   }
}
