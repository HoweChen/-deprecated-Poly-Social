'use strict';

angular.module('polySocialApp', [
  'polySocialApp.auth',
  'polySocialApp.admin',
  'polySocialApp.constants',
  // 'polySocialApp.fromNow',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
