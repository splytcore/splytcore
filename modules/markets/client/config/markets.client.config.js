(function () {
  'use strict';

  angular
    .module('markets')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Markets',
      state: 'markets',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'markets', {
      title: 'List Markets',
      state: 'markets.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'markets', {
      title: 'Create Market',
      state: 'markets.create',
      roles: ['user']
    });
  }
}());
