(function () {
  'use strict'

  angular
    .module('sellers')
    .run(menuConfig)

  menuConfig.$inject = ['Menus']

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Sellers',
      state: 'sellers',
      type: 'dropdown',
      roles: ['seller']
    })

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'sellers', {
      title: 'Dashboard',
      state: 'sellers.dashboard',
      roles: ['seller']
    })
    Menus.addSubMenuItem('topbar', 'sellers', {
      title: 'My Assets',
      state: 'sellers.assets',
      roles: ['seller']
    })
    Menus.addSubMenuItem('topbar', 'sellers', {
      title: 'Batch Upload Assets',
      state: 'sellers.batchuploadassets',
      roles: ['seller']
    })
  }
}())
