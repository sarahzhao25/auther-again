const authRouter = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {User} = require('../db/models');

authRouter.get('/me', (req, res, next) => {
  res.json(req.session.user)
})

//Google authentication and login
//this request responds by sending the user to the provider login (google login) with the request token. User gives permission here & tells Service Provider to authorize request token & SP does so.
//The callback function here is FROM passport that gives us data from Google, and then RETURN a user object TO passport.
//'done' needs to be called
//This is '3. User is redirected to service provider.'
authRouter.get('/google', passport.authenticate('google', {scope: 'email'}))

//Does passport.authenticate go to passport.use? What's going on here.

//the 'google' strategy from passport.authenticate
//if you call 'done()' or 'done(null)' it will register as a failure and you will be failureRedirected. If you tried instead to console.log & then do done(null, profile), you will declare a SUCCESS, and the credentials are good. done(null, false) will declare a FAILURE with bad credentials.
passport.use(
  new GoogleStrategy({
    clientID: '355049045573-qv9ugdk6s9d7ci2m84aak0uo3pdmk34m.apps.googleusercontent.com',
    clientSecret: 'sAiEW6j2ti24V02qxb_t31l0',
    callbackURL: '/api/auth/google/callback'
  }, (token, refreshToken, profile, done) => {
    let {id, displayName, emails} = profile;
    User.findOrCreate({
      where: {
        googleId: id
      },
      defaults: {
        name: displayName,
        email: emails[0].value,
        photo: profile.photos ? profile.photos[0].value : undefined
      }
    })
    .spread((user, isCreated) => {
      done(null, user) //the 'user' is returned to PASSPORT.
      //This is after 4. User Gives Permission & the Service provider marks request token as good-to-go.
    })
    .catch(err => done(err));
})
)

//For every request - WHICH IS JUST CALLING PASSPORT.AUTHENTICATE & STRATEGY, passport will attempt to deserialize the user off of the session and attach it as req.user. (this is req.login(user))
//take a small part of user
passport.serializeUser((user, done) => {
  done(null, user.id);
})
//give the user back as an object
passport.deserializeUser((id, done) => {
  User.findById(id)
  .then(user => done(null, user))
  .catch(err => done(err));
})

//handle the callback after Google has authenticated the user
//callback is to request for authorization given the temp code (thus the 'google' strategy with ID and password) => server now authenticates with the provider with the code + secret.
//the temp code is the request TOKEN and SECRET
//the provider will respond (if successful) with a permanent access token & other user info.
//This is 5. 'Consumer requests access with secret, and receives access token upon success.
//6. Redirects = accesses service with access token.
authRouter.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/users',
  failureRedirect: '/login'
}))

module.exports = authRouter;
