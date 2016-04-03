'use strict';

angular.module('polySocialApp', [
  'polySocialApp.auth',
  'polySocialApp.admin',
  'polySocialApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'infinite-scroll'
  // 'polySocialApp.fromNow'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
