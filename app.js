var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var whitelist = require('./whitelist');
var Meatspace = require('meatspace-leveldb');

nconf.argv().env().file({ file: 'local.json' });

/* Filters for routes */

var isLoggedIn = function(req, res, next) {
  if (req.session.email && whitelist.indexOf(req.session.email) > -1) {
    next();
  } else {
    res.status(400);
    next(new Error('Invalid login'));
  }
};

var meat = new Meatspace({
  fullName: nconf.get('full_name'),
  username: nconf.get('username'),
  postUrl: nconf.get('url'),
  db: nconf.get('db'),
  limit: 12
});

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require('./routes')(app, meat, isLoggedIn, nconf);

app.listen(process.env.PORT || nconf.get('port'));
