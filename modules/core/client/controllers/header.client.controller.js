'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', '$cookies', '$rootScope',
  function ($scope, $state, Authentication, Menus, $cookies, $rootScope) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    $rootScope.etherBalance = $cookies.etherBalance
    $rootScope.tokenBalance = $cookies.tokenBalance

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
