'use strict';
/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  })
}


/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
}

// Takes care of global pagination, sort with any db key and sort order
exports.paginate = function (req, res, next) {
  // commented this out to force limit 10 items if query params are not present
  // if(!req.query.limit && !req.query.skip) {
  //   console.log('limit params not found')
  //   return next()
  // }

  // Handles pagination
  req.paginate = {
    skip: req.query.skip > 0 ? parseInt(req.query.skip) : 0,
    limit: req.query.limit > 0 ? parseInt(req.query.limit) : 10
  }

  // Handles sort key and order
  if(req.query.sort) {
    let sortOrder = req.query.sort[0]
    let sort
    if( sortOrder === '-' && req.query.sort.length > 0 ) {
      sort = req.query.sort.split('-')[1]
      req.paginate.sort = {
        [sort] : -1 
      }
    } else {
      sort = req.query.sort
      req.paginate.sort = {
        [sort] : 1
      }
    }
  } else {
    req.paginate.sort = {
      created: -1
    }
  }

  next()
}
