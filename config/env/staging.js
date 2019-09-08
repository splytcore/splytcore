'use strict';

var defaultEnvConfig=require('./default');

module.exports={
  db: {
    uri: process.env.mongoIpAddress + ':' + process.env.mongoPort + '/' + process.env.mongoDbName,
    options: {
      user: process.env.mongoUser,
      pass: process.env.mongoPassword
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG||false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      //stream: {
      //  directoryPath: process.cwd(),
      //  fileName: 'access.log',
      //  rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
      //    active: false, // activate to use rotating logs 
      //    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
      //    frequency: 'daily',
      //    verbose: false
      //  }
      //}
    }
  },
  app: {
    title: defaultEnvConfig.app.title+' - Development Environment'
  },
  ethereum: {
    //Get this from testrpc for dev
    url: 'http://' + process.env.ethereumIpAddress + ':' + process.env.ethereumPort,
    //this has to be updated everytime you run truffle migrate
    splytManagerAddress: process.env.ethereumManagerContractAddress,
    masterWallet: process.env.ethereumMasterWallet,
    etherscanURL: 'https://ropsten.etherscan.io/tx/'
  },
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED==='true'? true:false,
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS==='false'? false:true,
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME||'user',
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL||'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME||'admin',
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL||'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user','admin']
      }
    }
  }
};
