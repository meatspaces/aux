'use strict';

$(function () {
  var form = $('form');

  form.submit(function (ev) {
    ev.preventDefault();

    $.post('/add', form.serialize(), function (data) {
      console.log('posted');
      window.close();
    }).error(function () {
      console.log('error')
    });
  });
});
