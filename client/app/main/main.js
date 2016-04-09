'use strict';

angular.module('polySocialApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        template: '<main></main>'
      })
      .state('favourite', {
        url: '/users/:userId/favourite',
        template: '<favourite></favourite>',
        resolve: {
          query: function ($stateParams) {
            return {
              stars: $stateParams.userId
            };
          }
        }
      })
      .state('mine', {
        url: '/users/:userId',
        template: '<mine></mine>',
        resolve: {
          query: function ($stateParams) {
            return {
              user: $stateParams.userId
            };
          }
        }
      });



  });
