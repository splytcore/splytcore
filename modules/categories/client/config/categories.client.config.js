(function () {
  'use strict';

  angular
    .module('categories')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Categories',
      state: 'categories',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'categories', {
      title: 'List Categories',
      state: 'categories.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'categories', {
      title: 'Create Category',
      state: 'categories.create',
      roles: ['user']
    });
  }
}());
