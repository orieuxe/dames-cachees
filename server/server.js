var express   = require('express');
var app       = express();

const clientPath = `${__dirname}/../client`;
const constants = require(`${clientPath}/commons/constants.js`);

app.use(express.static(clientPath));

app.set('view engine', 'ejs');
app.set('views', `${clientPath}/views`);

app.get('/', function(req, res) {
    res.render(`pages/index`);
});

app.get('/list', function(req, res) {
  res.render(`pages/list`);
});

app.get('/live', function(req, res) {
  res.render(`pages/live`);
});

app.get('/rules', function(req, res) {
  res.render(`pages/rules`);
});

var server = app.listen(process.env.PORT || constants.LOCALHOSTPORT);

var io = require('socket.io').listen(server);

require('./waitingRoom')(io);
require('./gameRoomList')(io);
