'use strict';

module.exports={
  app: {
    title: 'Splyt',
    description: 'splytcore2 API',
    keywords: 'Splytcore2 API',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID||'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT||3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 48*(60*60*1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.sessionSecret,
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.png',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
      limits: {
        fileSize: 1*1024*1024 // Max file size in bytes (1 MB)
      }
    }
  },
  mailer: {
    service: 'Gmail',
    options: {
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
        user: process.env.supportEmail,
        pass: process.env.supportEmailPassword //google signin password  using less secure
      }
    }
  },
  /* jshint ignore:end */
  /*eslint-enable */
  actions: ['CHANGED_DEPT','CHANGED_STAGE','CHANGED_STATUS','CHANGED_POSITION','CHANGED_APPOINTMENT','OTHER'],
  shopify: {
    apiKey: process.env.shopifyKey,
    apiKeySecret: process.env.shopifyKeySecret
  }
}
