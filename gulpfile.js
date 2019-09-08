'use strict'

/**
 * Module dependencies.
 */
const _ = require('lodash')
const defaultAssets = require('./config/assets/default')
const testAssets = require('./config/assets/test')
const gulp = require('gulp')
const async = require('async')
const gulpLoadPlugins = require('gulp-load-plugins')
const runSequence = require('run-sequence')
const plugins = gulpLoadPlugins({
    rename: {
      'gulp-angular-templatecache': 'templateCache'
    }
  })
const path = require('path')
const endOfLine = require('os').EOL
const uglify = require('gulp-uglify-es').default

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test'
})

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development'
  console.log('dev development selected')
  require('dotenv').config({ path: path.resolve('./.env.local') })
})

// Set NODE_ENV to 'development'
gulp.task('env:stage', function () {
  process.env.NODE_ENV = 'production'
  require('dotenv').config({ path: path.resolve('./.env.staging') })
})

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production'
  require('dotenv').config({ path: path.resolve('./.env.production') })
})

// Nodemon task
gulp.task('nodemon', function () {
  return plugins.nodemon({
    script: 'server.js',
    // nodeArgs: ['--debug'],
    ext: 'js,html',
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  })
})

// Watch Files For Changes
gulp.task('watch', function () {
  // Start livereload
  plugins.livereload.listen()

  // Add watch rules
  gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed)
  gulp.watch(defaultAssets.server.allJS, ['jshint']).on('change', plugins.livereload.changed)
  gulp.watch(defaultAssets.client.js, ['jshint']).on('change', plugins.livereload.changed)
  gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed)

  gulp.watch(defaultAssets.client.sass, ['sass', 'csslint']).on('change', plugins.livereload.changed)
  gulp.watch(defaultAssets.client.less, ['less', 'csslint']).on('change', plugins.livereload.changed)

  if (process.env.NODE_ENV === 'production') {
    gulp.watch(defaultAssets.server.gulpConfig, ['templatecache', 'jshint'])
    gulp.watch(defaultAssets.client.views, ['templatecache', 'jshint']).on('change', plugins.livereload.changed)
  } else {
    gulp.watch(defaultAssets.server.gulpConfig, ['jshint'])
    gulp.watch(defaultAssets.client.views).on('change', plugins.livereload.changed)
  }
})

// JS linting task
gulp.task('jshint', function () {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    // defaultAssets.client.js,
    testAssets.tests.server
    // testAssets.tests.client,
    // testAssets.tests.e2e
  )

  return gulp.src(assets)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.jshint.reporter('fail'))
})

// ESLint JS linting task
gulp.task('eslint', function () {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    // defaultAssets.client.js,
    testAssets.tests.server
    // testAssets.tests.client,
    // testAssets.tests.e2e
  )

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
})

// CSS linting task
gulp.task('csslint', function (done) {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.reporter())
    .pipe(plugins.csslint.reporter(function (file) {
      if (!file.csslint.errorCount) {
        done()
      }
    }))
})

// JS minifying task
gulp.task('uglify', function () {
  var assets = _.union(
    defaultAssets.client.js,
    defaultAssets.client.templates
  )

  return gulp.src(assets)
    .pipe(plugins.ngAnnotate())
    .pipe(uglify())
    .pipe(plugins.concat('application.min.js'))
    .pipe(gulp.dest('public/dist'))
})

// CSS minifying task
gulp.task('cssmin', function () {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.cssmin())
    .pipe(plugins.concat('application.min.css'))
    .pipe(gulp.dest('public/dist'))
})

// Sass task
gulp.task('sass', function () {
  return gulp.src(defaultAssets.client.sass)
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer())
    .pipe(plugins.rename(function (file) {
      file.dirname = file.dirname.replace(path.sep + 'scss', path.sep + 'css')
    }))
    .pipe(gulp.dest('./modules/'))
})

// Less task
gulp.task('less', function () {
  return gulp.src(defaultAssets.client.less)
    .pipe(plugins.less())
    .pipe(plugins.autoprefixer())
    .pipe(plugins.rename(function (file) {
      file.dirname = file.dirname.replace(path.sep + 'less', path.sep + 'css')
    }))
    .pipe(gulp.dest('./modules/'));
})

// Angular template cache task
gulp.task('templatecache', function () {
  var re = new RegExp('\\' + path.sep + 'client\\' + path.sep, 'g')

  return gulp.src(defaultAssets.client.views)
    .pipe(plugins.templateCache('templates.js', {
      root: 'modules/',
      module: 'core',
      templateHeader: '(function () {' + endOfLine + '	\'use strict\';' + endOfLine + endOfLine + '	angular' + endOfLine + '		.module(\'<%= module %>\'<%= standalone %>)' + endOfLine + '		.run(templates);' + endOfLine + endOfLine + '	templates.$inject = [\'$templateCache\'];' + endOfLine + endOfLine + '	function templates($templateCache) {' + endOfLine,
      templateBody: '		$templateCache.put(\'<%= url %>\', \'<%= contents %>\');',
      templateFooter: '	}' + endOfLine + '})();' + endOfLine,
      transformUrl: function (url) {
        return url.replace(re, path.sep)
      }
    }))
    .pipe(gulp.dest('build'))
})


// Mocha tests task
gulp.task('mocha', function (done) {
  // Open mongoose connections
  var mongoose = require('./config/lib/mongoose.js')
  var error

  // Connect mongoose
  mongoose.connect(function () {
    mongoose.loadModels()
    // Run the tests
    gulp.src(testAssets.tests.server)
      .pipe(plugins.mocha({
        reporter: 'spec',
        timeout: 100000000
      }))
      .on('error', function (err) {
        // If an error occurs, save it
        console.log(err)
        error = err
      })
      .on('end', function () {
        // When the tests are done, disconnect mongoose and pass the error state back to gulp
        mongoose.disconnect(function () {
          done(error)
        })
      })
  })

})


// Discoonnect the MongoDB database, used in testing
// gulp.task('dropdb', function (done) {
//   // Use mongoose configuration
//   var mongoose = require('./config/lib/mongoose.js');
  
//   mongoose.connect(function (db) {
//     db.connection.db.dropDatabase(function (err) {
//       if(err) {
//         console.log(err);
//       } else {
//         console.log('Successfully dropped db: ', db.connection.db.databaseName);
//       }
//       db.connection.db.close(done);
//     });
//     db.connection.db.close(done)
//   });
// });


// drops all collection except users
gulp.task('dropcollections', function (done) {
  // Use mongoose configuration
  var mongoose = require('./config/lib/mongoose.js')

  async.waterfall([
    function(cb) {
      mongoose.connect(function (db) {
        cb(null, db)
      })
    },
    function(db, cb) {
      console.log('dropping assets')
      db.connection.db.dropCollection('assets', (err) => {
        cb(null,db)
      })        
    },
    function(db, cb) {
      console.log('dropping orders')
      db.connection.db.dropCollection('orders', (err) => {
        cb(null,db)
      })    
    },
    function(db, cb) {
      console.log('dropping arbitrations')
     db.connection.db.dropCollection('arbitrations', (err) => {
        cb(null, db)
      })
    },
    function(db, cb) {
      console.log('dropping reputations')
      db.connection.db.dropCollection('reputations', (err) => {
        cb(null,db)
      })
    },
    function(db, cb) {
      console.log('dropping analytics')
      db.connection.db.dropCollection('analytics', (err) => {
        cb(null,db)
      })
    }
  ], function (err, db) {
    if (err) {
      console.log(err)
    } 
    db.connection.db.close(done)
  })


})

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
  runSequence('env:dev', ['uglify'], done)
})


gulp.task('test', function (done) {
  runSequence('env:test', 'mocha', done)
})


// Run the project in development mode
gulp.task('default', function (done) {
  runSequence('env:dev', ['nodemon', 'watch'], done)
})

// Run the project in debug mode
gulp.task('debug', function (done) {
  runSequence('env:dev', ['nodemon', 'watch'], done)
})

// Run the project in production mode
gulp.task('prod', function (done) {
  runSequence('templatecache', 'build', 'env:prod', ['nodemon', 'watch'], done)
})
