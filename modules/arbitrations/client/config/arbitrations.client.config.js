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

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'arbitrations', {
      title: 'List Arbitrations',
      state: 'arbitrations.list'
    })
  }
}());
