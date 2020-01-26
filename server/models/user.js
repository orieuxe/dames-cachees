var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: {type: String, unique: true, required: true, max: 100},
    lastLogin: {type: Date, default:Date.now},
    elo: {type: Number, required: true}
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
