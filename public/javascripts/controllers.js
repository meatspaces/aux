'use strict';

angular.module('aux.controllers', []).
  controller('AppCtrl', function ($scope, persona, $rootScope, $http, $location) {
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

    $rootScope.login = function () {
      persona.login();
    };

    $rootScope.logout = function () {
      persona.logout();
    }
  }).
  controller('HomeCtrl', function ($scope, $http) {

  });
