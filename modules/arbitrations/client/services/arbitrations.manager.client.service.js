// Arbitrations service used to communicate Arbitrations REST endpoints
(function () {
  'use strict';

  angular
    .module('arbitrations')
    .service('ArbitraitionsManagerService', ArbitraitionsManagerService);

  ArbitraitionsManagerService.$inject = ['$http'];

  function ArbitraitionsManagerService($http) {
    // return $resource('api/arbitrations/:arbitrationId/:updateType', {
    let vm = this
    vm.baseURL = 'api/arbitrations/'

    vm.setArbitrator = setArbitrator
    vm.set2xStakeBySeller = set2xStakeBySeller
    vm.set2xStakeByReporter = set2xStakeByReporter

    vm.setWinner = setWinner

    function setArbitrator(arbitrationId) {

      return $http.post(vm.baseURL + arbitrationId + '/setArbitrator')
    }


    function set2xStakeBySeller(arbitrationId) {
      return $http.post(vm.baseURL + arbitrationId + '/set2xStakeBySeller')
    }

    function set2xStakeByReporter(arbitrationId) {
      return $http.post(vm.baseURL + arbitrationId + '/set2xStakeByReporter')
    }

    function setWinner(arbitrationId, winner) {
      return $http.post(vm.baseURL + arbitrationId + '/setWinner', { winner: winner })
    }    
  }
}());
