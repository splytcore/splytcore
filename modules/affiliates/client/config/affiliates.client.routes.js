(function () {
  'use strict';

  angular
    .module('affiliates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('affiliates', {
        abstract: true,
        url: '/affiliates',
        template: '<ui-view/>'
      })
      .state('affiliates.dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/affiliates/client/views/form-affiliate.client.view.html',
        controller: 'AffiliatesController',
        controllerAs: 'vm',
        resolve: {
          affiliateResolve: newAffiliate
        },
        data: {
          roles: ['affiliate', 'admin'],
          pageTitle: 'Affiliates Create'
        }
      })
  }

  getAffiliate.$inject = ['$stateParams', 'AffiliatesService'];

  function getAffiliate($stateParams, AffiliatesService) {
    return AffiliatesService.get({
      affiliateId: $stateParams.affiliateId
    }).$promise;
  }

  newAffiliate.$inject = ['AffiliatesService'];

  function newAffiliate(AffiliatesService) {
    return new AffiliatesService();
  }
}());
