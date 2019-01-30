// Arbitrations service used to communicate Arbitrations REST endpoints
(function () {
    'use strict';
  
    angular
      .module('stripes')
      .service('StripesManagerService', StripesManagerService);
  
      StripesManagerService.$inject = ['$http'];
  
    function StripesManagerService($http) {
      let vm = this
      vm.instagramBaseURL = 'api/instagram/'
      vm.saveIgCode = saveIgCode
      
      function saveIgCode(igCode, redirectUri) {
          return $http.post('api/instagram/saveIgCode', {
              igCode: igCode,
              redirectUri: redirectUri
          })
      }
    }
  }());
  