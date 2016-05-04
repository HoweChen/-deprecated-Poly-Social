'use strict';

angular.module('polySocialApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('main', {
        url: '/?keyword',
        template: '<main></main>',
        resolve: {
          query: function () {
            return null;
          }
        }
      })
      .state('search', {
        url: '/search/?keyword',
        template: '<main></main>'
          // resolve: {
          //   query: function () {
          //     return null;
          //   }
          // }
      })
      .state('favourite', {
        url: '/users/:userID/favourite?keyword',
        template: '<main></main>',
        resolve: {
          query: function ($stateParams) {
            return {
              stars: $stateParams.userId
            };
          }
        }
      })
      .state('mine', {
        url: '/users/:userID?keyword',
        template: '<main></main>',
        resolve: {
          query: function ($stateParams) {
            return {
              user: $stateParams.userId
            };
          }
        }
      });



  });
