(function () {
  'use strict';

  angular
    .module('hashtags')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Hashtags',
      state: 'hashtags',
      type: 'dropdown',
      roles: ['*']
    })

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'hashtags', {
      title: 'List Hashtags',
      state: 'hashtags.list'
    })
  }
}());
