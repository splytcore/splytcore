(function () {
  'use strict';

  angular
    .module('hashtags')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('hashtags', {
        abstract: true,
        url: '/hashtags',
        template: '<ui-view/>'
      })
      .state('hashtags.list', {
        url: '',
        templateUrl: 'modules/hashtags/client/views/list-hashtags.client.view.html',
        controller: 'HashtagsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Hashtags List'
        }
      })
      .state('hashtags.create', {
        url: '/create/:assetId',
        templateUrl: 'modules/hashtags/client/views/form-hashtag.client.view.html',
        controller: 'HashtagsController',
        controllerAs: 'vm',
        resolve: {
          hashtagResolve: newHashtag
        },
        data: {
          roles: ['user', 'admin', 'affiliate'],
          pageTitle: 'Hashtags Create'
        }
      })
      .state('hashtags.edit', {
        url: '/:hashtagId/edit',
        templateUrl: 'modules/hashtags/client/views/form-hashtag.client.view.html',
        controller: 'HashtagsController',
        controllerAs: 'vm',
        resolve: {
          hashtagResolve: getHashtag
        },
        data: {
          roles: ['user', 'admin', 'affiliate'],
          pageTitle: 'Edit Hashtag {{ hashtagResolve.name }}'
        }
      })
      .state('hashtags.view', {
        url: '/:hashtagId',
        templateUrl: 'modules/hashtags/client/views/view-hashtag.client.view.html',
        controller: 'HashtagsController',
        controllerAs: 'vm',
        resolve: {
          hashtagResolve: getHashtag
        },
        data: {
          pageTitle: 'Hashtag {{ hashtagResolve.name }}'
        }
      });
  }

  getHashtag.$inject = ['$stateParams', 'HashtagsService'];

  function getHashtag($stateParams, HashtagsService) {
    return HashtagsService.get({
      hashtagId: $stateParams.hashtagId
    }).$promise;
  }

  newHashtag.$inject = ['HashtagsService'];

  function newHashtag(HashtagsService) {
    return new HashtagsService();
  }
}());
