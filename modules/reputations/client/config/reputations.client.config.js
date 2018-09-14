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
      roles: ['*']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reputations', {
      title: 'List Reputations',
      state: 'reputations.list'
    })

  }
}());
