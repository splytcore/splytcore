'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$state', 'Authentication', 'Menus', '$cookies', 'SystemsService',
  function ($rootScope, $scope, $state, Authentication, Menus, $cookies, SystemsService) {
    // Expose view variables
    $scope.$state = $state;

    $scope.authentication = Authentication

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

  
    SystemsService.getSettings()
      .then((result) => {
        $rootScope.env = result.data.env
      })    

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
