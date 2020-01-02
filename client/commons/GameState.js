const GameState = Object.freeze({
    HQSELECT: "hqslect",
    ONGOING:  "ongoing",
    OVER:     "over",
    MATCH_OVER:"matchOver"
});

if (typeof module !== 'undefined') {
  module.exports = GameState;
}
