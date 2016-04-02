'use strict';


angular.module('polySocialApp.fromNow')
  .filter('fromNow', function() {
    return function(input) {
      return moment(input).local(window.navigator.language).fromNow();
    };
  });
