'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth, $location) {

      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;
      var keyword = $location.search().keyword;


      //send get request with keyword
      if (keyword !== undefined) {
        this.$http.get('/api/things', {
          params: {
            keyword: keyword
          }
        }).then(response => {
          this.awesomeThings = response.data;
          this.socket.syncUpdates('thing', this.awesomeThings);
        });
      } else {
        //send the nomal get request
        this.$http.get('/api/things').then(response => {
          this.awesomeThings = response.data;
          this.socket.syncUpdates('thing', this.awesomeThings);
        });
      }

      // if (keyword) {
      //   // RegEx search
      //   // query = _.merge(query, {name: {$regex: $scope.keyword, $options: 'i'}});
      //   // Full-text search
      //   query = _.merge(query, {
      //     $text: {
      //       $search: keyword
      //     }
      //   });
      // }



      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });

      // $scope.isMyTweet = function (thing) {
      //   return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
      // };
      // $scope.isMyStar = function (thing) {
      //   return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf(Auth.getCurrentUser()._id) !== -1;
      // };
      //
      // $scope.starThing = function (thing) {
      //   $http.put('/api/things/' + thing._id + '/star').success(function (newthing) {
      //     $scope.awesomeThings[$scope.awesomeThings.indexOf(thing)] = newthing;
      //   });
      // };
      // $scope.unstarThing = function (thing) {
      //   $http.delete('/api/things/' + thing._id + '/star').success(function (newthing) {
      //     $scope.awesomeThings[$scope.awesomeThings.indexOf(thing)] = newthing;
      //   });
      // };
      // $scope.isMyStar = function (thing) {
      //   return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf(Auth.getCurrentUser()._id) !== -1;
      // };


    }

    // $onInit(keyword) {
    //   // var keyword = $location.search().keyword;
    //   console.log(keyword);
    //   this.$http.get('/api/things').then(response => {
    //     this.awesomeThings = response.data;
    //     this.socket.syncUpdates('thing', this.awesomeThings);
    //   });
    // }

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
})();
