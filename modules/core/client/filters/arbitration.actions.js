'use strict';

angular.module('core').filter('ArbitrationActionsFilter', () => {

    return function(actions, s) {

      var out = []

      let status =  parseInt(s)         

      actions.forEach((action, i) => {
        let actionId = parseInt(action.id)
        if (status == 1 ) {   
          out.push(action)
        }

        if (status == 2 ) {   
          if (actionId == 4 || actionId == 5) {
            out.push(action)
          } 
        }
      })

      return out
    }

})
