(function () {
  'use strict';

  describe('Hashtags Route Tests', function () {
    // Initialize global variables
    var $scope,
      HashtagsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _HashtagsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      HashtagsService = _HashtagsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('hashtags');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/hashtags');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          HashtagsController,
          mockHashtag;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('hashtags.view');
          $templateCache.put('modules/hashtags/client/views/view-hashtag.client.view.html', '');

          // create mock Hashtag
          mockHashtag = new HashtagsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Hashtag Name'
          });

          // Initialize Controller
          HashtagsController = $controller('HashtagsController as vm', {
            $scope: $scope,
            hashtagResolve: mockHashtag
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:hashtagId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.hashtagResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            hashtagId: 1
          })).toEqual('/hashtags/1');
        }));

        it('should attach an Hashtag to the controller scope', function () {
          expect($scope.vm.hashtag._id).toBe(mockHashtag._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/hashtags/client/views/view-hashtag.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          HashtagsController,
          mockHashtag;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('hashtags.create');
          $templateCache.put('modules/hashtags/client/views/form-hashtag.client.view.html', '');

          // create mock Hashtag
          mockHashtag = new HashtagsService();

          // Initialize Controller
          HashtagsController = $controller('HashtagsController as vm', {
            $scope: $scope,
            hashtagResolve: mockHashtag
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.hashtagResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/hashtags/create');
        }));

        it('should attach an Hashtag to the controller scope', function () {
          expect($scope.vm.hashtag._id).toBe(mockHashtag._id);
          expect($scope.vm.hashtag._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/hashtags/client/views/form-hashtag.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          HashtagsController,
          mockHashtag;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('hashtags.edit');
          $templateCache.put('modules/hashtags/client/views/form-hashtag.client.view.html', '');

          // create mock Hashtag
          mockHashtag = new HashtagsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Hashtag Name'
          });

          // Initialize Controller
          HashtagsController = $controller('HashtagsController as vm', {
            $scope: $scope,
            hashtagResolve: mockHashtag
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:hashtagId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.hashtagResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            hashtagId: 1
          })).toEqual('/hashtags/1/edit');
        }));

        it('should attach an Hashtag to the controller scope', function () {
          expect($scope.vm.hashtag._id).toBe(mockHashtag._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/hashtags/client/views/form-hashtag.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
