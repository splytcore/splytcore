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
      roles: ['user', 'admin']
    })

    Menus.addSubMenuItem('topbar', 'analytics', {
      title: 'Affiliates Analytics',
      state: 'analytics.affiliates'
    }) 

    Menus.addSubMenuItem('topbar', 'analytics', {
      title: 'Summary Report',
      state: 'analytics.summary'
    })


  }
}())
