const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

/* "Enhancing" middleware (does not send response, server-side effects only) */
app.use(volleyball);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express-Session setup
app.use(session({
  secret: 'sam-sandy-sarah-2018',
  resave: false
}))

// Express-session counter (test)
app.use('/api', function(req, res, next) {
  if (!req.session.counter) req.session.counter = 0;
  console.log('counter', ++req.session.counter);
  next();
});

app.use(function(req, res, next) {
  console.log('session', req.session);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

//to access req.user from your passport, it NEEDS to utilize passport.session() first to be able to access it, since that is what will actually put the user on the req.user object.
app.use((req, res, next) => {
  console.log('req.user', req.user);
  next();
})

/* "Responding" middleware (may send a response back to client) */
app.use('/api', require('./api'));

const validFrontendRoutes = ['/', '/stories', '/users', '/stories/:id', '/users/:id', '/signup', '/login'];
const indexPath = path.join(__dirname, '../public/index.html');
validFrontendRoutes.forEach(stateRoute => {
  app.get(stateRoute, (req, res, next) => {
    res.sendFile(indexPath);
  });
});

/* Static middleware */
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../node_modules')))

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).send(err.message || 'Internal Error');
});

module.exports = app;
