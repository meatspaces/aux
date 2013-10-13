'use strict';

var gravatar = require('gravatar');

exports.isEditor = function (req, avatar) {
  var whitelist = require('../whitelist');

  if (req.session && req.session.email &&
      whitelist.indexOf(req.session.email) > -1 &&
      avatar === gravatar.url(req.session.email)) {
    return true;
  }

  return false;
};
