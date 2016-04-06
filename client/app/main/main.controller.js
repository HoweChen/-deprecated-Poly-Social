'use strict';

( function () {

  class MainController {

    constructor( $http, $scope, socket, Auth ) {

      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;
      $scope.busy = true;
      $scope.noMoreData = false;

      // var keyword = $location.ion.search().keyword;

      $scope.$on( '$destroy', function () {
        socket.unsyncUpdates( 'thing' );
      } );

      $scope.isMyTweet = function ( thing ) {
        return Auth.isLoggedIn() && thing.user && thing.user._id === Auth.getCurrentUser()._id;
      };
      $scope.isMyStar = function ( thing ) {
        return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf( Auth.getCurrentUser()._id ) !== -1;
      };

      $scope.starThing = function ( thing ) {
        $http.put( '/api/things/' + thing._id + '/star' ).success( function ( newthing ) {
          $scope.awesomeThings[ $scope.awesomeThings.indexOf( thing ) ] = newthing;
        } );
      };
      $scope.unstarThing = function ( thing ) {
        $http.delete( '/api/things/' + thing._id + '/star' ).success( function ( newthing ) {
          $scope.awesomeThings[ $scope.awesomeThings.indexOf( thing ) ] = newthing;
        } );
      };
      $scope.isMyStar = function ( thing ) {
        return Auth.isLoggedIn() && thing.stars && thing.stars.indexOf( Auth.getCurrentUser()._id ) !== -1;
      };

      // $scope.nextPage = function() {
      //   if($scope.busy) {
      //     return;
      //   }
      //   $scope.busy = true;
      //   var lastId = $scope.awesomeThings[$scope.awesomeThings.length - 1]._id;
      //   var pageQuery = _.merge(query, {
      //     _id: {
      //       $lt: lastId
      //     }
      //   });
      //   $http.get('/api/things', {
      //     params: {
      //       query: pageQuery
      //     }
      //   }).success(function(awesomeThings_) {
      //     $scope.awesomeThings = $scope.awesomeThings.concat(awesomeThings_);
      //     $scope.busy = false;
      //     if(awesomeThings_.length === 0) {
      //       $scope.noMoreData = true;
      //     }
      //   });
      // };
    }



    $onInit() {
      this.$http.get( '/api/things' ).then( response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates( 'thing', this.awesomeThings );
        // if(this.awesomeThings.length < 20) {
        //   this.noMoreData = true;
        // }
        // this.busy = false;
      } );
    }

    addThing() {
      if ( this.newThing ) {
        this.$http.post( '/api/things', {
          name: this.newThing
        } );
        this.newThing = '';
      }
    }




    deleteThing( thing ) {
      this.$http.delete( '/api/things/' + thing._id );
    }



  }

  angular.module( 'polySocialApp' )
    .component( 'main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    } );


} )();
