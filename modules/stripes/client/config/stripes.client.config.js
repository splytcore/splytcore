(function () {
  'use strict';

  angular
    .module('stripes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Stripes',
      state: 'stripes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'stripes', {
      title: 'List Stripes',
      state: 'stripes.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'stripes', {
      title: 'Create Stripe',
      state: 'stripes.create',
      roles: ['affiliate']
    });
  }
}());
