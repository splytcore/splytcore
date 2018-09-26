(function () {
  'use strict';

  angular
    .module('assets')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Assets',
      state: 'assets',
      type: 'dropdown',
      roles: ['*']
    });


    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List Pending Assets',
      state: 'assets.listPending'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List All Assets',
      state: 'assets.list'
    });

    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List My Assets',
      state: 'assets.listMyAssets'
    });




    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'Create Asset',
      state: 'assets.create',
      roles: ['user']
    });
  }
}());
