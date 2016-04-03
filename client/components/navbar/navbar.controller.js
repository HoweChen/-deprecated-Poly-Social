'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  }];

  isCollapsed = true;
  //end-non-standard




  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;

    // $scope.search = function(keyword) {
    //   if($state.current.controller === 'MainController') {
    //     $state.go($state.current.name, {
    //       keyword: keyword
    //     }, {
    //       reload: true
    //     });
    //   } else {
    //     $state.go('main', {
    //       keyword: keyword
    //     }, {
    //       reload: true
    //     });
    //   }
    // };
  }
}

angular.module('polySocialApp')
  .controller('NavbarController', NavbarController);
