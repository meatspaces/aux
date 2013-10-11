'use strict';

module.exports = function(app, isLoggedIn) {
  app.get('/login', isLoggedIn, function (req, res) {
    res.json({
      email: req.session.email
    });
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });
};
