(function () {
  'use strict';

  angular
    .module('dashboards')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Dashboards',
      state: 'dashboards',
      type: 'dropdown',
      roles: ['seller']
    })

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Seller Dashboard',
      state: 'dashboards.seller'
    })

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'List New Item',
      state: 'dashboards.seller.create'
    })

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Listings',
      state: 'dashboards.seller.assets'
    })

    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Sales',
      state: 'dashboards.seller.orders'
    })


    Menus.addSubMenuItem('topbar', 'dashboards', {
      title: 'Arbitrator Dashboard',
      state: 'dashboards.arbitrator'
    })
  }
}())
