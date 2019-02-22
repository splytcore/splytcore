(function () {
  'use strict'

  angular
    .module('analytics')
    .run(menuConfig)

  menuConfig.$inject = ['Menus']

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Analytics',
      state: 'analytics',
      type: 'dropdown',
      roles: ['user', 'admin', 'seller' , 'affiliate', 'customer']
    });

    Menus.addSubMenuItem('topbar', 'analytics', {
      title: 'Summary Report',
      state: 'analytics.summary'
    })
  }
}())
