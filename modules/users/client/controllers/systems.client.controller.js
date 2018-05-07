'use strict';

angular.module('users.admin').controller('SystemsController', ['$q', 'SystemsService', '$scope', 'Authentication',
  function ($q, SystemsService, $scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;    

    SystemsService.getSettings()
      .success((result) => {
        console.log(result)        
        $scope.settings = result
      })
      .error((err) => {
        console.log('err')
        console.log(err)
      })
    

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
