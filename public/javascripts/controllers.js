'use strict';

angular.module('aux.controllers', []).
  controller('AppCtrl', function ($scope, persona, $rootScope, $http, $location) {
    var YOUTUBE = /(youtube.com(?:\/#)?\/watch\?)|(youtu\.be\/[A-Z0-9-_]+)/i;
    var VIMEO = /vimeo.com\/[0-9]+/i;

    $rootScope.socket = io.connect(location.protocol + '//' + location.hostname +
      (location.port ? ':' + location.port : ''));

    $rootScope.isVimeo = function (post) {
      return (post && !!post.content.urls[0].url.match(VIMEO));
    };

    $rootScope.isYoutube = function (post) {
      return (post && !!post.content.urls[0].url.match(YOUTUBE));
    };

    $rootScope.isSecondary = false;

    $rootScope.isAuthenticated = false;

    if (localStorage.getItem('personaEmail')) {
      $rootScope.isAuthenticated = true;

      if (!$rootScope.email) {
        $http({
          url: '/login',
          method: 'GET'
        }).success(function (data) {

          $rootScope.email = data.email;
        }).error(function (data) {

          console.log('Login failed because ' + data);
        });
      }
    }

    $rootScope.getVideoId = function (p) {
      // Try youtube's long url
      var url = p.content.urls[0].url.split('watch?v=')[1];

      // If the url match doesn't exist or it is a vimeo match
      if ($scope.isVimeo(p) || !url) {

        url = p.content.urls[0].url.split('/');
        p.videoId = url[url.length - 1];
      } else {

        p.videoId = url;
      }

      return p.videoId;
    };

    $rootScope.login = function () {
      persona.login();
    };

    $rootScope.logout = function () {
      persona.logout();
    }
  }).
  controller('HomeCtrl', function ($scope, $http, $rootScope) {
    $rootScope.isSecondary = false;
    $scope.posts = [];

    var getPreview = function (p) {
      var url = $rootScope.getVideoId(p);

      if ($rootScope.isVimeo(p)) {
        $http.jsonp('http://vimeo.com/api/v2/video/' + p.videoId + '.json?callback=JSON_CALLBACK'
        ).success(function (data) {
          p.src = data[0].thumbnail_large;
        }).error(function (err, data) {
          console.log('could not get vimeo image');
        });
      } else {
        p.src = 'http://img.youtube.com/vi/' + p.videoId + '/0.jpg';
      }

      return p
    };

    $rootScope.socket.on('connect', function () {
      $rootScope.socket.on('feed', function (data) {
        data.post = getPreview(data.post);

        $scope.$apply(function () {
          $scope.posts.unshift(data.post);
        });
      });
    });

    $http({
      url: '/api/recent',
      method: 'GET'
    }).success(function (data) {
      $scope.posts = data.posts;

      $scope.posts.forEach(function (p) {
        p = getPreview(p);
      });

    }).error(function (data) {

      console.log('could not retrieve posts');
    });
  }).
  controller('MediaCtrl', function ($scope, $http, $routeParams, $rootScope, $sce, $location) {
    $scope.id = parseInt($routeParams.id, 10);

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }

    $scope.deletePost = function (post) {
      $http({
        url: '/api/v/' + post.id,
        method: 'DELETE'
      }).success(function (data) {

        $location.path('/');
      }).error(function (data) {

        console.log('could not delete');
      });
    };

    $rootScope.isSecondary = true;

    $http({
      url: '/api/v/' + $scope.id,
      method: 'GET'
    }).success(function (data) {
      var url = $rootScope.getVideoId(data.post);

      $scope.title = data.post.content.urls[0].title;
      $scope.data = data;
    }).error(function (data) {

      console.log('id not found');
    });
  }).
  controller('ErrorLoginCtrl', function ($rootScope) {
    $rootScope.isAuthenticated = false;
    $rootScope.email = null;
  });
