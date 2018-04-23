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
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'departments', {
      title: 'List',
      state: 'departments.list'
    })
    Menus.addSubMenuItem('topbar', 'departments', {
      title: 'Create',
      state: 'departments.create'
    })

  }
}());
