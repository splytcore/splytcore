'use strict';

// Create the candidates socket configuration
module.exports = function (io, socket) {
  
  console.log('init candidates socket...')

  //Can be called from anywhere
  global.emitCheckin = function (candidate) {    
    io.emit('checkinChannel', candidate)    
  }
  
  global.emitLockCandidate = function (candidate) {        
    io.emit('lockedChannel', candidate) 
  }
  
  global.emitUnlockCandidate = function (candidate) {        
    io.emit('unlockedChannel', candidate) 
  }

  global.emitRejectCandidate = function (candidate) {        
    io.emit('rejectChannel', candidate) 
  }

  global.emitInterviewCandidate = function (candidate) {        
    console.log('emting interview candidate with object')
    console.log(candidate)
    io.emit('interviewChannel', candidate) 
  }

  global.emitValuatedCandidate = function (candidate) {        
    io.emit('valuatedChannel', candidate) 
  }

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    console.log('socket disconnected')
  })
};


