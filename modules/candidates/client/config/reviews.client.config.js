(function () {
  'use strict';

  angular
    .module('candidates')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Reviews',
      state: 'reviews',
      type: 'dropdown',
      roles: ['admin','user']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reviews', {
      title: 'List Reviews',
      state: 'reviews.list',      
      roles: ['admin','user']
    })

  }
}());
