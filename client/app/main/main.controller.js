'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth) {

      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;
      $scope.busy = true;
      $scope.noMoreData = false;

      // $http.get('/api/things', {
      //   params: {
      //     query: query
      //   }
      // }).success(function (awesomeThings) {
      //   $scope.awesomeThings = awesomeThings;
      //   socket.syncUpdates('thing', $scope.awesomeThings);
      // });

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });

      $scope.isMyTweet = function (thing) {
        return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
      };
      $scope.isMyStar = function (thing) {
        return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf(Auth.getCurrentUser()._id) !== -1;
      };

      $scope.starThing = function (thing) {
        $http.put('/api/things/' + thing._id + '/star').success(function (newthing) {
          $scope.awesomeThings[$scope.awesomeThings.indexOf(thing)] = newthing;
        });
      };
      $scope.unstarThing = function (thing) {
        $http.delete('/api/things/' + thing._id + '/star').success(function (newthing) {
          $scope.awesomeThings[$scope.awesomeThings.indexOf(thing)] = newthing;
        });
      };
      $scope.isMyStar = function (thing) {
        return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf(Auth.getCurrentUser()._id) !== -1;
      };


    }





    $onInit() {
      this.$http.get('/api/things').then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
    }

    addThing() {
      if (this.newThing) {
        this.$http.post('/api/things', {
          name: this.newThing
        });
        this.newThing = '';
      }
    }




    deleteThing(thing) {
      this.$http.delete('/api/things/' + thing._id);
    }





  }

  angular.module('polySocialApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });


  // angular.module('polySocialAPP')
  //   .config(function ($stateProvider) {
  //     $stateProvider
  //       .state('main', {
  //         url: '/',
  //         templateUrl: 'app/main/main.html',
  //         controller: MainController,
  //         resolve: {
  //           query: function () {
  //             return null;
  //           }
  //         },
  //       })
  //       .state('starred', {
  //         url: '/users/:userId/starred',
  //         templateUrl: 'app/main/main.html',
  //         controller: MainController,
  //         resolve: {
  //           query: function ($stateParams) {
  //             return {
  //               stars: $stateParams.userId
  //             };
  //           }
  //         }
  //       })
  //       .state('user', {
  //         url: '/users/:userId',
  //         templateUrl: 'app/main/main.html',
  //         controller: MainController,
  //         resolve: {
  //           query: function ($stateParams) {
  //             return {
  //               user: $stateParams.userId
  //             };
  //           }
  //         }
  //       });
  //   });
})();
