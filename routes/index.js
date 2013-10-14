'use strict';

var gravatar = require('gravatar');
var Feed = require('feed');

var feed = new Feed({
  title: 'aux.meatspac.es',
  description: "What we're listening to and watching",
  link: 'http://aux.meatspac.es',
  image: 'http://aux.meatspac.es/logo.png',
  author: {
    name: 'aux',
    email: 'jen@meatspac.es',
    link: 'http://meatspac.es'
  }
});

var utils = require('../lib/utils');

module.exports = function(app, io, meat, isLoggedIn, nconf) {
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
          message: gravatar.url(req.session.email),
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
              io.sockets.emit('feed', {
                post: post
              });

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

  app.get('/feed', function (req, res) {
    res.redirect('/api/recent');
  });

  app.get('/api/recent', function (req, res) {
    var prevPage = 0;
    var nextPage = 0;
    var currPage = 0;

    if (req.query.page) {
      currPage = parseInt(req.query.page, 10) || 0;
    }

    meat.shareRecent(req.query.page || 0, function (err, posts) {
      nextPage = currPage + 1;

      if (posts.length < meat.limit) {
        nextPage = 0;
      }

      prevPage = currPage - 1;

      if (prevPage < 0) {
        prevPage = 0;
      }

      res.format({
        json: function () {
          res.send({
            posts: posts,
            prev: prevPage,
            next: nextPage
          });
        },
        xml: function () {
          posts = posts.sort(function (a, b) {
            return b.id - a.id
          });

          posts.forEach(function (p) {
            feed.item({
              title: p.content.urls[0].url,
              link: p.content.urls[0].url,
              description: '<p>posted by <img src="' + p.content.message + '"></p>',
              date: new Date(p.id)
            });
          });

          res.send(feed.render('rss-2.0'));
        }
      });
    });
  });

  app.get('/api/v/:id', function (req, res) {
    meat.get(req.params.id, function (err, post) {
      if (err || (!req.session.email && post.meta.isPrivate)) {

        res.status(404);
        res.json({
          message: 'not found'
        });

      } else {

        res.send({
          post: post,
          isAdmin: utils.isEditor(req, post.content.message),
          prev: false,
          next: false
        });
      }
    });
  });

  app.delete('/api/v/:id', isLoggedIn, function (req, res) {
    meat.get(req.params.id, function (err, post) {
      if (err) {

        res.status(404);
        res.json({
          message: 'not found'
        });

      } else {

        if (post.content.message === gravatar.url(req.session.email)) {

          meat.del(req.params.id, function (err, status) {
            if (err) {
              res.status(400);
              res.json({
                message: err.toString()
              })
            } else {
              res.json({
                message: 'deleted'
              });
            }
          });
        } else {

          res.status(400);
          res.json({
            message: 'not allowed to delete'
          });
        }
      }
    });
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });
};
