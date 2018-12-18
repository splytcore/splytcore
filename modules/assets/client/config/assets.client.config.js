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
      roles: ['user', 'admin']
    });


    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List Pending Assets',
      state: 'assets.listPending'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List All Mined Assets',
      state: 'assets.list'
    });

    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List My Assets',
      roles: ['user'],
      state: 'assets.listMyAssets'
    });


    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List Fractional Assets',
      state: 'assets.listFractional'
    });



    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'List Normal Assets',
      state: 'assets.listNormal'
    });  


    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'assets', {
      title: 'Create Asset',
      state: 'assets.create',
      roles: ['user']
    });
  }
}());
