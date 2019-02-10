// Hashtags service used to communicate Hashtags REST endpoints
(function () {
  'use strict';

  angular
    .module('hashtags')
    .factory('HashtagsService', HashtagsService);

  HashtagsService.$inject = ['$resource'];

  function HashtagsService($resource) {
    return $resource('api/hashtags/:hashtagId', {
      hashtagId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
