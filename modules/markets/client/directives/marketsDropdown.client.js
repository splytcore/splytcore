'use strict';

//TODO: directive to create dropdown for markets list so it can be reused

angular.module('markets')
  .directive('marketsDropdown', function() {

	console.log('this being called?')
  
	return {
		restrict: 'E',	
		transclude: 'true',
		template: '<span ng-transclude></span>',
		link: function(scope, element, attr){
		      element.append("<strong>"+attr.title+"</strong>");
		}		
	}

  })
