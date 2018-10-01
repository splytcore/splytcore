(function () {
  'use strict'

  angular
    .module('arbitrations')
    .run(menuConfig)

  menuConfig.$inject = ['Menus']

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Arbitrations',
      state: 'arbitrations',
      type: 'dropdown',
      roles: ['*']
    })

    Menus.addSubMenuItem('topbar', 'arbitrations', {
      title: 'List Pending Arbitrations',
      state: 'arbitrations.listPending'
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'arbitrations', {
      title: 'List My Arbitrations',
      state: 'arbitrations.listMyArbitrations'
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'arbitrations', {
      title: 'List All Mined Arbitrations',
      state: 'arbitrations.list'
    })
  }
}());
