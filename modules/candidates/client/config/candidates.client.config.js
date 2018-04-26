(function () {
  'use strict';

  angular
    .module('candidates')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Candidates',
      state: 'candidates',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'candidates', {
      title: 'List Candidates',
      state: 'candidates.list',      
      roles: ['admin', 'user']
    });
    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'candidates', {
      title: 'Register',
      state: 'candidates.register'
    });

    Menus.addSubMenuItem('topbar', 'candidates', {
      title: 'Checkin',
      state: 'candidates.checkin'
    });

    Menus.addSubMenuItem('topbar', 'candidates', {
      title: 'Checkin Queue',
      state: 'candidates.checkinQueue',
      roles: ['admin', 'user']
    });

  }
}());
