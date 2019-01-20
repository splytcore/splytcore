(function () {
  'use strict';

  angular
    .module('carts')
    .run(menuConfig)

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Shopping Carts',
      state: 'carts',
      type: 'dropdown',
      roles: ['affiliate', 'customer', 'seller']
    })

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'carts', {
      title: 'Carts',
      state: 'carts.list',
      roles: ['affiliate', 'customer', 'seller']
    })
    Menus.addSubMenuItem('topbar', 'carts', {
      title: 'My Shopping Cart',
      state: 'carts.create',
      roles: ['affiliate', 'customer', 'seller']
    })    
  }
}())
