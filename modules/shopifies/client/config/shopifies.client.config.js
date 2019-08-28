(function () {
  'use strict';

  angular
    .module('shopifies')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Shopify',
      state: 'shopifies',
      type: 'dropdown',
      roles: ['seller', 'admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shopifies', {
      title: 'Show status',
      state: 'shopifies.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'shopifies', {
      title: 'Authorize',
      state: 'shopifies.create',
      roles: ['seller', 'admin']
    });
  }
}());
