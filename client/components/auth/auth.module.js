'use strict';

angular.module('polySocialApp.auth', [
  'polySocialApp.constants',
  'polySocialApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
