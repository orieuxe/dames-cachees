const constants = Object.freeze({
    LOCALHOSTPORT: 8080,
    WAITINGROOM:  "waitingRoom",
    AUTO_LOGIN:   true
});

if (typeof module !== 'undefined') {
  module.exports = constants;
}
