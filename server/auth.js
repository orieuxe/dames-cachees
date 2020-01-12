var express = require('express');
var passport = require('passport');
var Strategy = require('passport-lichess').Strategy;


// Configure the Lichess strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Lichess API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
const localhostConfig = {
  clientID: 'MLlIeXIR9Ub7vXtn',
  clientSecret: 'YYwGtw3jybcDuC7RrpJWQRmBqwtPULfK',
  callbackURL: '/return'
};

const herokuConfig = {
  clientID: 'vgv3RS0VK5E55ka4',
  clientSecret: 'GVt7X3jHA2SDpsQWoYJjD1seCcYDy2OR',
  callbackURL: '/return'
}

var env = process.argv[2];
switch (env) {
  case 'dev':
    var startegyConfig = localhostConfig;
    break;
  case 'prod':
    var startegyConfig = herokuConfig;
    break;
}

passport.use(new Strategy(startegyConfig,
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Lichess profile is supplied as the user
    // record.  In a production-quality application, the Lichess profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Lichess profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


module.exports = (app) => {
  // Use application-level middleware for common functionality, including
  // logging, parsing, and session handling.
  app.use(require('morgan')('combined'));
  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // Define routes.
  app.get('/login', passport.authenticate('lichess'));

  app.get('/return', passport.authenticate('lichess', {
    successReturnToOrRedirect : '/live',
    failureRedirect           : '/login'
  }));

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
}
