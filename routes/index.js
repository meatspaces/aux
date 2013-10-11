'use strict';

module.exports = function(app, isLoggedIn) {
  app.get('/login', isLoggedIn, function (req, res) {
    res.json({
      email: req.session.email
    });
  });

  app.get('/logout', isLoggedIn, function (req, res) {
    res.redirect('/');
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });
};
