'use strict';

var utils = require('../lib/utils');

module.exports = function(app, meat, isLoggedIn, nconf) {
  var YOUTUBE = /(youtube.com(?:\/#)?\/watch\?)|(youtu\.be\/[A-Z0-9-_]+)/i;
  var VIMEO = /vimeo.com\/[0-9]+/i;

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

    var escapeHtml = function (text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    if (!url) {

      res.status(400);
      res.json({
        message: 'URL cannot be empty'
      });
    } else if (url.match(YOUTUBE) || url.match(VIMEO)) {

      var message = {
        content: {
          message: '',
          urls: []
        },
        meta: {
          location: '',
          isPrivate: req.body.is_private || false,
          isShared: false
        },
        shares: []
      };

      message.content.urls.push({
        title: escapeHtml(title),
        url: escapeHtml(url)
      });

      meat.create(message, function (err, post) {
        if (err) {

          res.status(400);
          next(err);
        } else {

          message.meta.originUrl = nconf.get('domain') + ':' + nconf.get('authPort') +
            '/share/' + post.id;
          meat.update(message, function (err, post) {
            if (err) {
              res.status(400);
              next(err);
            } else {
              res.json({
                message: 'posted'
              });
            }
          });
        }
      });
    } else {

      res.status(400);
      res.json({
        message: 'Not a valid Youtube/Vimeo URL'
      });
    }
  });

  app.get('/api/recent', function (req, res) {
    meat.shareRecent(req.query.start || 0, function (err, posts) {
      res.json({
        posts: posts,
        total: posts.length
      });
    });
  });

  app.get('/api/share/:id', function (req, res) {
    meat.get(req.params.id, function (err, post) {
      if (err || (!req.session.email && post.meta.isPrivate)) {

        res.status(404);
        res.json({
          message: 'not found'
        });

      } else {

        res.send({
          post: post,
          isAdmin: utils.isEditor(req),
          prev: false,
          next: false
        });
      }
    });
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });
};
