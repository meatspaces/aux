'use strict';

module.exports = function(app, isLoggedIn) {
  app.get('/login', isLoggedIn, function (req, res) {
    res.json({
      email: req.session.email
    });
  });

  app.get('/add', isLoggedIn, function (req, res) {
    res.render('add');
  });

  app.post('/add', isLoggedIn, function (req, res) {
    var title = req.body.title.toString().trim();
    var url = req.body.url.toString().trim();

    if (!url) {
      res.status(400);
      res.json({
        message: 'URL cannot be empty'
      });
    } else {
      res.json({
        message: 'posted'
      });
    }
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });
};
