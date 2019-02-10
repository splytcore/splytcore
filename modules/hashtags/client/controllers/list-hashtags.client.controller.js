(function () {
  'use strict';

  angular
    .module('hashtags')
    .controller('HashtagsListController', HashtagsListController);

  HashtagsListController.$inject = ['HashtagsService'];

  function HashtagsListController(HashtagsService) {
    var vm = this;

    vm.hashtags = HashtagsService.query();
  }
}());
