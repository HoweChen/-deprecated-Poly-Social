'use strict';

angular.module('polySocialApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/?keyowrd',
        template: '<main></main>'
      });


  });
