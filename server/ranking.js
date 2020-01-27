var glicko2 = require('glicko2');
var UserModel = require('./models/user');

var defaults = {
  elo : 1500,
  rd:200,
  vol:0.06
}

var settings = {
  // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
  //      be tested to decide which value results in greatest predictive accuracy."
  tau : 0.5,
  // rating : default rating
  rating : defaults.elo,
  //rd : Default rating deviation
  //     small number = good confidence on the rating accuracy
  rd : defaults.rd,
  //vol : Default volatility (expected fluctation on the player rating)
  vol : defaults.vol
};
var ranking = new glicko2.Glicko2(settings);

var ratings = [null, null];

const registerPlayers = (white, black, cb) => {
  let elos = {};
  [white, black].forEach((username, i) => {
    UserModel.findOne({ username: username }, (error, user) => {
      if (user === null || !user.rating) { //anon or new user
        rating = ranking.makePlayer();
      }else{
        rating = ranking.makePlayer(user.rating.elo, user.rating.rd, user.rating.vol);
      }
      rating.username = username;

      ratings[i] = rating;
      elos[username] = rating.getRating();
      if (i == 1) {
        cb(elos);
      }
    });
  });
}

const updateRatings = (result) => {
  let match = [ratings[0], ratings[1], result];
  let newElos = {};
  ranking.updateRatings([match]);
  ratings.forEach((rating,i) => {
    let newRating = {
      elo: rating.getRating(),
      rd: rating.getRd(),
      vol: rating.getVol()
    }
    UserModel.updateOne({username:rating.username },{ rating: newRating }, (error, user) => {
      if (error) throw error;
    });

    newElos[rating.username] = newRating.elo;
  });
  return newElos;
}

module.exports = {
  registerPlayers,
  updateRatings
}
