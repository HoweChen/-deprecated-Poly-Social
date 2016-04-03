'use strict';

angular.module('polySocialApp.fromNow')
  .filter('fromNow', function() {
    return function(input) {
      return 'fromNow filter: ' + input;
    };
  });
