(function () {
  'use strict';

  angular
    .module('analytics')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Analytics',
      state: 'analytics',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'analytics', {
      title: 'List Analytics',
      state: 'analytics.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'analytics', {
      title: 'Create Analytic',
      state: 'analytics.create',
      roles: ['user']
    });
  }
}());
