'use strict';

$(function () {
  var form = $('form');

  var url = decodeURIComponent(document.location.href.split('?url=')[1]);

  form.find('#url').val(url);

  form.submit(function (ev) {
    ev.preventDefault();

    $.post('/add', form.serialize(), function (data) {

      window.close();
    }).error(function (data) {

      form.find('#url').val('')
                       .attr('placeholder', data.responseJSON.message)
                       .addClass('error');
    });
  });
});
