var express   = require('express');
var app       = express();

const clientPath = `${__dirname}/../client`;
const constants = require(`${clientPath}/commons/constants.js`);

app.get('/list', function (req, res) {
  res.sendFile('./list.html', { root: clientPath });
})

app.get('/live', function (req, res) {
  res.sendFile('./live.html', { root: clientPath });
})

app.use(express.static(clientPath));

var server = app.listen(process.env.PORT || constants.LOCALHOSTPORT);

var io = require('socket.io').listen(server);

require('./waitingRoom')(io);
require('./gameRoomList')(io);
