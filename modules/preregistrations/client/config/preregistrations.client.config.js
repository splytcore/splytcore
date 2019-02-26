(function () {
  'use strict';

  angular
    .module('preregistrations')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Preregistrations',
      state: 'preregistrations',
      type: 'dropdown',
      roles: ['admin', 'user']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'preregistrations', {
      title: 'List Preregistrations',
      state: 'preregistrations.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'preregistrations', {
      title: 'Create Preregistration',
      state: 'preregistrations.create',
      roles: ['user', 'admin']
    });
  }
}());
