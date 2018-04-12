(function () {
  'use strict';

  angular
    .module('candidates')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Positions',
      state: 'positions',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'positions', {
      title: 'List Positions',
      state: 'positions.list'
    });

    Menus.addSubMenuItem('topbar', 'positions', {
      title: 'New',
      state: 'positions.create'
    });


  }
}());
