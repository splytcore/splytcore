'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', '$cookies', 'EthService',
  function ($scope, $state, Authentication, Menus, $cookies, EthService) {
    // Expose view variables
    $scope.$state = $state;

    if (Authentication.user) {    
      EthService.updateUserBalances()
    }
    
    $scope.authentication = Authentication

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);
