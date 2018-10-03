'use strict';

angular.module('core').controller('HomeController', ['$q', '$scope', 'Authentication', 'EthService', '$cookies',
  function ($q, $scope, Authentication, EthService, $cookies) {
    // This provides Authentication context.
    $scope.authentication = Authentication
    $scope.user = $scope.authentication.user
    EthService.getSplytServiceInfo()
      .success((result) => {
        $scope.splyt = result
        $cookies.etherscanURL = result.etherscanURL
      })
      .catch((err) => {
        console.log(err)
      })


    if ($scope.user) {
      EthService.getUserBalances()
        .success((balances) => {
          console.log(balances)
          $scope.user.etherBalance = balances.etherBalance
          $scope.user.tokenBalance = balances.tokenBalance    
          $cookies.tokenBalance = balances.tokenBalance
          $cookies.etherBalance = balances.etherBalance

          if (parseFloat(balances.etherBalance) < .10 ||  parseInt(balances.tokenBalance) < 1) {
            alert('You do not have the minimium requirements of tokens or Ether to write to the blockchain!')
          }

        })
        .error((err) => {

        })
      }
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
