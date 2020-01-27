var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RatingSchema = new Schema(
  {
    elo: {type: Number, required: true},
    rd: {type: Number, required: true},
    vol: {type: Number, required: true},
  }
);

var UserSchema = new Schema(
  {
    username: {type: String, unique: true, required: true, max: 100},
    lastLogin: {type: Date, default:Date.now},
    rating: RatingSchema
  }
);

// Virtual for author's URL
UserSchema
.virtual('url')
.get(() => {
  return '/catalog/user/' + this._id;
});

//Export model
module.exports = mongoose.model('User', UserSchema);
