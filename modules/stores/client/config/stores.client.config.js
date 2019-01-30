(function () {
  'use strict';

  angular
    .module('stores')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Stores',
      state: 'stores',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'stores', {
      title: 'List Stores',
      state: 'stores.list'
    });

    // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'stores', {
    //   title: 'Create Store',
    //   state: 'stores.create',
    //   roles: ['affiliate', 'user']
    // });
  }
}());
