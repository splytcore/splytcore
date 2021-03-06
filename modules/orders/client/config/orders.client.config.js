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
      roles: ['user', 'admin']
    })

    Menus.addSubMenuItem('topbar', 'orders', {
      title: 'List Pending Orders',
      state: 'orders.listPending'
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'orders', {
      title: 'List My Orders',
      roles: ['user'],
      state: 'orders.listMyOrders'
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'orders', {
      title: 'List All Mined Orders',
      state: 'orders.list'
    })

  }
}());
