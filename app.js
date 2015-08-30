var express             = require('express')
    ,app                = express()
    ,path               = require('path')
    ,favicon            = require('serve-favicon')
    ,logger             = require('morgan')
    ,cookieParser       = require('cookie-parser')
    ,bodyParser         = require('body-parser')
    ,session            =require('express-session')
    ,passport           = require('passport')
    ,FacebookStrategy   = require('passport-facebook').Strategy;



global._Config = require('./config/app_config');
global._Common = require('./common');

/*
// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: _Config.facebook.api_key,
    clientSecret:_Config.facebook.api_secret ,
    callbackURL: _Config.facebook.callback_url
  },
  function(accessToken, refreshToken, profile, done) {

    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      //Further DB code.
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);
      return done(null, profile);
    });

  }
));
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(session({ secret: 'sec', key: 'sid'}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


//routes
var index    = require('./routes/index');
var database = require('./routes/database');
app.use('/', index);
app.use('/database', database);

/*
app.get('/account', ensureAuthenticated, function(req, res){
  //res.render('account', { user: req.user });
  res.send({ user: req.user });
});

app.get('/fail', function(req, res){
  res.send({msg:'fail'});
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
       successRedirect : '/',
       failureRedirect: '/fail'
  }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/fail')
}
*/


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

app.listen(_Config.PORT);
console.log('server start!');

module.exports = app;
