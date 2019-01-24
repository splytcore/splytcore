(function () {
  'use strict';

  angular
    .module('carts')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Carts',
      state: 'carts',
      type: 'dropdown',
      roles: ['user', 'admin']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'carts', {
      title: 'List Carts',
      roles: ['user', 'admin'],
      state: 'carts.list'
    })
  }
}());
