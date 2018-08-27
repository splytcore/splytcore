(function () {
  'use strict';

  angular
    .module('assets')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Assets',
      state: 'assets',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List Assets',
      state: 'assets.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'Create Asset',
      state: 'assets.create',
      roles: ['user']
    });
  }
}());
