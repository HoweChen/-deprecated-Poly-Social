'use strict';

angular.module('polySocialApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/?keyword',
        template: '<main></main>'
      });



  });
