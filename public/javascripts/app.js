'use strict';

angular.module('aux', [
  'ngRoute',
  'aux.factories',
  'aux.controllers'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      controller: 'HomeCtrl',
      templateUrl: 'partials/home.html'
    })
    .when('/invalid/login', {
      controller: 'ErrorLoginCtrl',
      templateUrl: 'partials/error_login.html'
    })
    .when('/add', {
      controller: 'MediaCtrl',
      templateUrl: 'partials/add.html'
    })
    .when('/v/:id', {
      controller: 'MediaCtrl',
      templateUrl: 'partials/single.html'
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
