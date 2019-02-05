'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;
                console.log('intercepter signin')
                // Redirect to signin page
                $location.path('authentication/signin');
                break;
              case 403:
                console.log('intercepter signup')
                // Add unauthorized behaviour
                $location.path('authentication/signup');
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);
