(function () {
  'use strict'

  angular
    .module('reputations')
    .run(menuConfig)

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Reputations',
      state: 'reputations',
      type: 'dropdown',
      roles: ['user', 'seller', 'admin']
    })


    Menus.addSubMenuItem('topbar', 'reputations', {
      title: 'List Pending Reputations',
      state: 'reputations.listPending'
    })
    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reputations', {
      title: 'List My Reputations',
      roles: ['user'],
      state: 'reputations.listMyReputations'
    })


    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reputations', {
      title: 'List All Mined Reputations',
      state: 'reputations.list'
    })

  }
}());
