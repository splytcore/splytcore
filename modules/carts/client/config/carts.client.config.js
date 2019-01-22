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
      roles: ['user', 'admin', 'seller', 'affiliate']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'carts', {
      title: 'List Carts',
      roles: ['user', 'user', 'seller', 'affiliate'],
      state: 'carts.list'
    })
  }
}());
