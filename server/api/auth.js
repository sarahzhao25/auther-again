const authRouter = require('express').Router();

authRouter.get('/me', (req, res, next) => {
  res.json(req.session.user)
})


module.exports = authRouter;
