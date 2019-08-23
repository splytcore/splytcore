(function () {
  'use strict';

  angular
    .module('shopifies')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Shopifies',
      state: 'shopifies',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shopifies', {
      title: 'List Shopifies',
      state: 'shopifies.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'shopifies', {
      title: 'Create Shopify',
      state: 'shopifies.create',
      roles: ['user']
    });
  }
}());
