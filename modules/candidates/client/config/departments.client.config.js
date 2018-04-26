(function () {
  'use strict';

  angular
    .module('candidates')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Departments',
      state: 'departments',
      type: 'dropdown',
      roles: ['admin', 'user']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'departments', {
      title: 'List',
      state: 'departments.list',
      roles: ['admin', 'user']
    })
    Menus.addSubMenuItem('topbar', 'departments', {
      title: 'Create',
      state: 'departments.create',
      roles: ['user', 'admin']
    })
    Menus.addSubMenuItem('topbar', 'departments', {
      title: 'Manage Appointments',
      state: 'departments.manageAppointments',
      roles: ['admin']
    })

  }
}());
