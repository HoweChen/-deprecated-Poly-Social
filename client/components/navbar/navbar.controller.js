'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  }, {
    'title': 'Mine',
    'state': 'mine'
  }, {
    'title': 'Favourite',
    'state': 'favourite'
  }];

  isCollapsed = true;
  //end-non-standard





  constructor($http, $state, $scope, socket, Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;

    $scope.search = function (keyword) {
      var keywordTemp = encodeURIComponent(keyword);
      // console.log(keywordTemp);
      if (keyword) {
        $state.go('search', {
          keyword: keywordTemp
        }, {
          reload: true
        });
      } else {
        $state.go('main', {
          reload: true
        });
      }
    };
  }
}

angular.module('polySocialApp')
  .controller('NavbarController', NavbarController);
