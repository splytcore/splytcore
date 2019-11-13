'use strict';

module.exports={
  secure: {
    ssl: true,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem'
  },
  port: 3000,
  db: {
    uri: process.env.mongoIpAddress + ':' + process.env.mongoPort + '/' + process.env.mongoDbName,
    options: {
      user: process.env.mongoUser,
      pass: process.env.mongoPassword
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG||false
  },
  ethereum: {
    //Get this from testrpc for dev
    url: 'http://' + process.env.ethereumIpAddress + ':' + process.env.ethereumPort,
    //this has to be updated everytime you run truffle migrate
    splytManagerAddress: process.env.ethereumManagerContractAddress,
    masterWallet: process.env.ethereumMasterWallet,
    etherscanURL: 'https://ropsten.etherscan.io/tx/'
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: process.env.LOG_FORMAT||'combined',
    body: true,
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      stream: {
        directoryPath: process.env.LOG_DIR_PATH||process.cwd(),
        fileName: process.env.LOG_FILE||'access.log',
        rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
          active: process.env.LOG_ROTATING_ACTIVE==='true'? true:false, // activate to use rotating logs 
          fileName: process.env.LOG_ROTATING_FILE||'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
          frequency: process.env.LOG_ROTATING_FREQUENCY||'daily',
          verbose: process.env.LOG_ROTATING_VERBOSE==='true'? true:false
        }
      }
    }
  },
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
