var UserModel = require('./models/user');

const getLeaderboard = (cb) => {
  UserModel.find()
  .select('username rating.elo')
  .limit(10)
  .sort({'rating.elo' : 'desc'})
  .exec((error, res) => {
    if (error) throw error;
    cb(res);
  })
}

module.exports = (app) => {
  app.get('/', (req, res) => {
    getLeaderboard((leaderboard) => {
      res.render('pages/index', {
        user: req.user,
        leaderboard : leaderboard
      });
    })
  });
}
