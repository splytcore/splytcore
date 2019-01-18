'use strict';

angular.module('core').controller('HomeController', ['$q', '$scope', 'Authentication', 'EthService', '$cookies', '$rootScope', '$interval',
  function ($q, $scope, Authentication, EthService, $cookies, $rootScope, $interval) {
    // This provides Authentication context.
    $scope.authentication = Authentication
    $scope.user = $scope.authentication.user
    // EthService.getSplytServiceInfo()
    //   .success((result) => {
    //     $scope.splyt = result
    //     $cookies.etherscanURL = result.etherscanURL
    //   })
    //   .catch((err) => {
    //     console.log(err)
    //   })

    // let callAtInterval = function() {
    //   console.log("Update User Balances");
    //   EthService.updateUserBalances()
    // }

    // if ($scope.user) {
    //   $interval(callAtInterval, 5000)

    // }


    //example of how simple async 
    // $q((resolve, reject) => {
    //   setTimeout(function() {            
    //     resolve('first phase')
    //   }, 5000)
    // })
    // .then((result) => {        
    //   console.log(result)
    //   return $q((resolve, reject) => {
    //     setTimeout(function() {            
    //       reject('second phase')
    //     }, 5000)                    
    //   })
    // })
    // .then((result) => {
    //   console.log(result)
    // })
    // .catch((err) => {
    //   console.log('error')
    //   console.log(err)
    // })

    //using defer instead
    // $q((resolve, reject) => {
    //   setTimeout(function() {            
    //     resolve('first phase')
    //   }, 5000)
    // })
    // .then((result) => {        
    //   console.log(result)
    //   let defer = $q.defer();      
    //   setTimeout(function() {            
    //     defer.resolve('second phase')        
    //   }, 5000)                    
    //   return defer.promise      
    // })
    // .then((result) => {
    //   console.log(result)
    //   let defer = $q.defer();      
    //   setTimeout(function() {            
    //     defer.resolve('third phase')        
    //   }, 5000)                    
    //   return defer.promise      
    // })
    // .then((result) => {
    //   console.log(result)
    // })    
    // .catch((err) => {
    //   console.log('error')
    //   console.log(err)
    // })

  //simple parallel 
  // $q.all([promise1(), promise2()])
  //   .then((result) => {
  //     console.log('successful')
  //     console.log(result)
  //   })
  //   .catch((error) => {
  //     console.log('error')
  //   })
    
  //   function promise1() {      
  //     return $q((resolve, reject) => {
  //       setTimeout(function() {            
  //         resolve('first phase')
  //       }, 5000)
  //     })      
  //   }

  //   function promise2() {      
  //     return $q((resolve, reject) => {
  //       setTimeout(function() {            
  //         resolve('second phase')
  //       }, 10000)
  //     })      
  //   }

  }
]);
