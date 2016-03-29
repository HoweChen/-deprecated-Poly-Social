'use strict';

(function() {

  class MainController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('thing');
      });

      $scope.isMyTweet = function(thing) {
        return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
      };
      $scope.isMyStar = function(thing) {
        return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf(Auth.getCurrentUser()._id) !== -1;
      };

      // $scope.isLoggedIn = this.auth.isLoggedIn;
      // $scope.getCurrentUser = this.auth.getCurrentUser;
      // $scope.isMyTweet = function(thing) {
      //   return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
      // }
    }

    $onInit() {
      this.$http.get('/api/things').then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
    }

    addThing() {
      if(this.newThing) {
        this.$http.post('/api/things', {
          name: this.newThing
        });
        this.newThing = '';
      }
    }

    deleteThing(thing) {
      this.$http.delete('/api/things/' + thing._id);
    }

    // isMyTweet(thing) {
    //   return this.auth.isLoggedIn() && thing.user && thing.user._id === this.auth.getCurrentUser()._id;
    // }


  }

  angular.module('polySocialApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });

  // angular.module('polySocialApp')
  //   .controller('MainCtrl', function($scope, $http, socket, Auth) {
  //     $scope.isLoggedIn = Auth.isLoggedIn;
  //     $scope.getCurrentUser = Auth.getCurrentUser;
  //     $scope.isMyTweet = function(thing) {
  //       return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
  //     };
  //   });

})();
