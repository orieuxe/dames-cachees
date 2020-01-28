var express     = require('express');
var app         = express();
var ensureLogin = require('connect-ensure-login');
require('./mongoose');

const clientPath = `${__dirname}/../client`;

app.use(express.static(clientPath));

app.set('view engine', 'ejs');
app.set('views', `${clientPath}/views`);

require('./auth')(app);
require('./home')(app);

app.get('/list', (req, res) => {
  res.render(`pages/list`, { user: req.user });
});

app.get('/live', (req, res) => {
  res.render(`pages/live`, { user: req.user });
});

app.get('/rules', (req, res) => {
  res.render(`pages/rules`, { user: req.user });
});

app.get('/profile',
  ensureLogin.ensureLoggedIn(),
  (req, res) => {
    res.render('pages/profile', { user: req.user });
  });

var server = app.listen(process.env.PORT || 8080);

var io = require('socket.io').listen(server);

require('./waitingRoom')(io);
require('./gameRoomList')(io);
