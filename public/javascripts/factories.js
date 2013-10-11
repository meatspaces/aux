'use strict';

angular.module('aux.factories', []).
  factory('persona', function ($rootScope, $http) {
    var login = function () {
      navigator.id.get(function (assertion) {
        if (!assertion) {
          return;
        }

        $http({
          url: '/persona/verify',
          method: 'POST',
          data: { assertion: assertion }
        }).success(function (data) {

          if (data.status === 'okay') {
            localStorage.setItem('personaEmail', data.email);
            $rootScope.isAuthenticated = true;

            $http({
              url: '/login',
              method: 'GET'
            }).success(function (data) {

              $rootScope.userId = data.userId;
            }).error(function (data) {

              console.log('Login failed because ' + data);
            });
          } else {
            console.log('Login failed because ' + data.reason);
          }
        }).error(function (data) {

          console.log('error logging in: ', data);
        });
      });
    };

    var logout = function () {
      $http({
        url: '/persona/logout',
        method: 'POST'
      }).success(function (data) {

        if (data.status === 'okay') {
          localStorage.removeItem('personaEmail');
          $rootScope.isAuthenticated = false;
          document.location.href = '/logout';
        } else {
          console.log('Logout failed because ' + data.reason);
        }
      }).error(function (data) {

        console.log('error logging out: ', data);
      })
    };

    return {
      login: login,
      logout: logout
    };
  });
