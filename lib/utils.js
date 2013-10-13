'use strict';

exports.isEditor = function (req, email) {
  var whitelist = require('../whitelist');

  if (req.session && req.session.email &&
      whitelist.indexOf(req.session.email) > -1 &&
      email === req.session.email) {
    return true;
  }
  req.session.reset();
  return false;
};
