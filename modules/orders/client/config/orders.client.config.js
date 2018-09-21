(function () {
  'use strict'

  angular
    .module('orders')
    .run(menuConfig)

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Orders',
      state: 'orders',
      type: 'dropdown',
      roles: ['*']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'orders', {
      title: 'List My Orders',
      state: 'orders.listMyOrders'
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'orders', {
      title: 'List All Orders',
      state: 'orders.list'
    })

  }
}());
