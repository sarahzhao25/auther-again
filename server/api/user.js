const router = require('express').Router();

const HttpError = require('../utils/HttpError');
const { Story, User } = require('../db/models');

router.param('id', (req, res, next, id) => {
  User.findById(id)
    .then(user => {
      if (!user) throw HttpError(404);
      req.requestedUser = user;
      next();
    })
    .catch(next);
});

router.get('/', (req, res, next) => {
  User.findAll()
    .then(users => res.json(users))
    .catch(next);
});

router.post('/', (req, res, next) => {
  User.create(req.body)
    .then(user => res.status(201).json(user))
    .catch(next);
});

/*

req.body:
{
  email: ____,
  password: _____
}

*/
router.post('/login', (req, res, next) => {
  User.find({
    where: {
      email: req.body.email
    }
  })
  .then(user => {
    if (!user) {
      let err = new Error('you fucked up! non-existent user');
      err.status = 404;
      throw err
    } else if (user.password !== req.body.password) {
      let err = new Error('wrong password, ya\' fuck!');
      err.status = 422;
      throw err;
    } else {
      req.login(user, (err) => {
        if (err) return next(err);
      });
      res.send(user);
    }
  })
  .catch(next)
});

router.post('/signup', (req, res, next) => {
  User.findOrCreate({
    where: {
      email: req.body.email
    }
  })
  .spread((user, isCreated) => {
    if (!isCreated) {
      const err = new Error('Ya dumb fuck. This is a duplicated user!')
      err.status = 502;
      throw err;
    }
    else {
      return user.update({password: req.body.password})
    }
  })
  .then(user => {
    req.login(user, (err) => {
      if (err) return next(err);
    }); //passport (session) exposes a login method that can be used to establish a login session. When the login operation completes, 'user' will be assigned to req.user.
    res.json(user);
  })
  .catch(err => next(err));
})

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.sendStatus(200);
})

router.get('/:id', (req, res, next) => {
  req.requestedUser.reload(User.options.scopes.populated())
    .then(requestedUser => res.json(requestedUser))
    .catch(next);
});

router.put('/:id', (req, res, next) => {
  req.requestedUser.update(req.body)
    .then(user => res.json(user))
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  req.requestedUser.destroy()
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;
