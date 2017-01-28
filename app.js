var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session')

var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var register = require('./routes/register');
var pass_recover = require('./routes/pass_recover');
var dresses = require('./routes/dresses');
var users = require('./routes/users');

var session = expressSession(
	{
		secret: 'lkjsfffws',
		key: 'sesionServidor',
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 30
		}
	}
)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session)
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')))

app.use('/', index)
app.use('/login', login)
app.use('/logout', logout)
app.use('/register', register)
app.use('/pass_recover', pass_recover)
app.use('/dresses', dresses)
app.use('/users', users)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
