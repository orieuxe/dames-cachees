var mongoose    = require('mongoose');

const mongoDB  = 'mongodb+srv://golum:JUuWp7FZNZz0pYE1@cluster0-0qzce.gcp.mongodb.net/db-cachee?retryWrites=true&w=majority';

mongoose.set('useCreateIndex', true);
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
