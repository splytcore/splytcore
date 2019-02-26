(function () {
  'use strict'

  angular
    .module('preregistrations')
    .run(menuConfig)

  menuConfig.$inject = ['Menus']

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Signup Tokens',
      state: 'preregistrations',
      type: 'dropdown',
      roles: ['admin', 'user']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'preregistrations', {
      title: 'List Signup Tokens',
      state: 'preregistrations.list'
    })

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'preregistrations', {
      title: 'Create Signup Tokens',
      state: 'preregistrations.create',
      roles: ['user', 'admin']
    })
  }
}())
