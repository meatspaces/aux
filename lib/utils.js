'use strict';

exports.isEditor = function (req) {
  var whitelist = require('../whitelist');

  if (req.session && req.session.email &&
      whitelist.indexOf(req.session.email) > -1) {
    return true;
  }
  req.session.reset();
  return false;
};

exports.setPagination = function (total, req, meat) {
  var start = parseInt(req.query.start, 10) || 0;
  var prev = 0;
  var next = meat.limit;

  if (isNaN(start)) {
    start = 0;
  }

  prev = start - meat.limit - 1;

  if (prev < 1) {
    prev = 0;
  }

  next = start + meat.limit + 1;

  if (next >= total) {
    next = false;
  }

  if (prev === start) {
    prev = false;
  }

  return {
    next: next,
    prev: prev
  };
};
