const constants = Object.freeze({
    LOCALHOSTPORT: 8080,
    WAITINGROOM:  "waitingRoom",
    AUTO_LOGIN:   false
});

if (typeof module !== 'undefined') {
  module.exports = constants;
}
