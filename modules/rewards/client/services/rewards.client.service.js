// Rewards service used to communicate Rewards REST endpoints
(function () {
  'use strict';

  angular
    .module('rewards')
    .factory('RewardsService', RewardsService);

  RewardsService.$inject = ['$resource'];

  function RewardsService($resource) {
    return $resource('api/rewards/:rewardId', {
      rewardId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
