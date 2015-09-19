var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');
var User = require('./models/user');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var api = require('./routes/api');

var pass = require('./authentication/passportConfig.js');

var app = express();

mongoose.connect('mongodb://localhost/podstream', function(err) {
  console.log(err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower', express.static(path.join(__dirname , 'bower_components')));
app.use(session({secret: 'test'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});


passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
});

var isAuthenticated = function(req, res, next) {
  console.log(req.url)
  if(req.isAuthenticated() || req.url==="/login") {
    return next();
  }
  res.redirect("/admin/login");
};

app.use('/', routes);
app.use('/users', users);
app.use('/admin', isAuthenticated,admin);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
