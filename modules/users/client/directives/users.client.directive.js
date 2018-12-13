'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  console.log('this si isafsdf')
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});
