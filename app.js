var express             = require('express')
    ,app                = express()
    ,path               = require('path')
    ,favicon            = require('serve-favicon')
    ,logger             = require('morgan')
    ,cookieParser       = require('cookie-parser')
    ,bodyParser         = require('body-parser')
    ,session            = require('express-session')
    ,passport           = require('passport')
    ,FacebookStrategy   = require('passport-facebook').Strategy
    ,LocalStrategy      = require('passport-local').Strategy
    ,redis              = require('redis')
    ,RedisStore         = require('connect-redis')(session);


global._Config = require('./config/app_config');
global._Common = require('./common');


app.use(session({
  secret : 'secret',
  store : new RedisStore({
    host : _Config.REDIS.HOST,
    port : _Config.REDIS.PORT,
    prefix:'sess:'
  }),
  cookie : {secure : false, maxAge : _Config.SESSION_TIME},
  resave : true,
  saveUninitialized : true
}));

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
var users = require('./routes/users');
app.use('/', index);
app.use('/database', database);
app.use('/users', users);

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
        console.error(err);
        res.status(err.status || 500).send(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err);
});

app.listen(_Config.PORT);
console.log('server start!');

module.exports = app;
