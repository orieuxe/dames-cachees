const GameState = Object.freeze({
    HQSELECT: "hqslect",
    ONGOING:  "ongoing",
    OVER:     "over"
});

if (typeof module !== 'undefined') {
  module.exports = GameState;
}
