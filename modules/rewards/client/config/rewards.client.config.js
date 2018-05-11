(function () {
  'use strict';

  angular
    .module('rewards')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Rewards',
      state: 'rewards',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'rewards', {
      title: 'List Rewards',
      state: 'rewards.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'rewards', {
      title: 'Create Reward',
      state: 'rewards.create',
      roles: ['user']
    });
  }
}());
