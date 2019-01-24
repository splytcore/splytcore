(function () {
  'use strict';

  angular
    .module('stripes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Stripe IG',
      state: 'stripes',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'stripes', {
      title: 'Authenticate IGram',
      state: 'stripes.list',
      roles: ['affiliate']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'stripes', {
      title: 'Stripe',
      state: 'stripes.create',
      roles: ['*']
    });
  }
}());
