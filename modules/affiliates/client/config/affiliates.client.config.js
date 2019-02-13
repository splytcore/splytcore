(function () {
  'use strict';

  angular
    .module('affiliates')
    .run(menuConfig)

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Affiliates',
      state: 'affiliates',
      type: 'dropdown',
      roles: ['affiliate']
    })

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'affiliates', {
      title: 'Affiliate Dashboard',
      state: 'affiliates.dashboard',
      roles: ['affiliate']
    })
    Menus.addSubMenuItem('topbar', 'affiliates', {
      title: 'Create Store',
      state: 'stores.create',
      roles: ['affiliate']
    })
    Menus.addSubMenuItem('topbar', 'affiliates', {
      title: 'My Stores Setup',
      state: 'affiliates.stores',
      roles: ['affiliate']
    })    
  }
}())
