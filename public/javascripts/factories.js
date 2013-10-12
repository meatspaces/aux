'use strict';

angular.module('aux.factories', []).
  factory('persona', function ($rootScope, $http, $location) {
    var resetUser = function () {
      localStorage.removeItem('personaEmail');
      $rootScope.isAuthenticated = false;
    };

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
            $http({
              url: '/login',
              method: 'GET'
            }).success(function (data) {

              localStorage.setItem('personaEmail', data.email);
              $rootScope.isAuthenticated = true;
              $rootScope.userId = data.userId;
              $location.path('/');
            }).error(function (data) {

              resetUser();
              $location.path('/invalid/login');
            });
          } else {

            resetUser();
            console.log('Login failed because ' + data);
          }
        }).error(function (data) {

          resetUser();
          console.log('error logging in: ', data);
        });
      });
    };

    var logout = function () {
      $http({
        url: '/persona/logout',
        method: 'POST'
      }).success(function (data) {

        resetUser();
        if (data.status !== 'okay') {
          console.log('Logout failed because ' + data.reason);
        }
      }).error(function (data) {

        resetUser();
        console.log('error logging out: ', data);
      })
    };

    return {
      login: login,
      logout: logout
    };
  });
