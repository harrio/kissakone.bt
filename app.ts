///<reference path='node/node.d.ts' />
///<reference path='node/express.d.ts' />
///<reference path='node/everyauth.d.ts' />
///<reference path='node/underscore.d.ts' />
/**
 * Module dependencies.
 */
import _ = require('underscore');
import express = require('express');
import routes = require('./routes/index');
import everyauth = require('everyauth');
import http = require('http');
import path = require('path');
import gpio = require("./services/gpio");
import api = require("./routes/api");
import rundb = require("./services/rundb");
import jf = require("./services/jsonfile");

var everyauthRoot = __dirname + '/..';

//everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

var config = jf.readFileSync(process.argv[2]);

var usersByLogin = {
  'morko': addUser({ login: config.user, password: config.password })
};

function addUser (source, sourceUser?) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.everymodule.handleLogout( function (req, res) {
  req.logout(); 
  console.log("Logged out");
  this.redirect(res, this.logoutRedirectPath());
});

function preEveryauthMiddlewareHack() {
    return function (req, res, next) {
      var sess = req.session
        , auth = sess.auth
        , ea:any = { loggedIn: !!(auth && auth.loggedIn) };

      // Copy the session.auth properties over
      for (var k in auth) {
        ea[k] = auth[k];
      }

      if (everyauth.enabled.password) {
        // Add in access to loginFormFieldName() + passwordFormFieldName()
        ea.password || (ea.password = {});
        ea.password.loginFormFieldName = everyauth.password.loginFormFieldName();
        ea.password.passwordFormFieldName = everyauth.password.passwordFormFieldName();
      }

      res.locals.everyauth = ea;

      next();
    }
};

function postEveryauthMiddlewareHack() {
  var userAlias = everyauth.expressHelperUserAlias || 'user';
  return function( req, res, next) {
    res.locals.everyauth.user = req.user;
    res.locals[userAlias] = req.user;
    next();
  };
};

var app = express.createServer  ();

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];
      return user;
    })
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerUser( function (newUserAttrs) {
      return false;
    })
    .loginSuccessRedirect('/');


app.configure(function() {
  app.use(express.logger());
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foobar' }));
  app.use(express.bodyParser());
  app.use(preEveryauthMiddlewareHack());
  app.use(everyauth.middleware(app));
  app.use(postEveryauthMiddlewareHack());
  app.use(express.methodOverride()); // delete & put
  //app.use(gallery.middleware({static: 'photos', directory: '.', rootURL: "/gallery"}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  //app.use('/gallery', express.static(path.join(__dirname, 'photos')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

app.post('/gpioOn', api.resetCycle);

app.get('/api/runs', api.findAllUndone);
app.get('/api/runsDone', api.findAllDone);
app.get('/api/run/:id', api.findById);
app.post('/api/run', api.addRun);
app.put('/api/run/:id', api.updateRun);
app.delete('/api/run/:id', api.deleteRun);

//app.get('/gallery*', function(req, res){
  // We automatically have the gallery data available to us in req thanks to middleware
  //var data = req.gallery;
  // and we can res.render using one of the supplied templates (photo.ejs/album.ejs) or one of our own
  //res.render(data.type + '.jade', data);
//});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var done = 0;
var reverse;

var forward = function() {
  gpio.registerListener(function(val) {
    console.log("Switch off: " + val);
    if (val == 1) {
      gpio.forwardOff();
      gpio.unregisterListener();
      done++;
      if (done < 9) {
        reverse();
      } 
    }
  });

  gpio.forwardOn();
}

reverse = function() {
  gpio.registerListener(function(val) {
    console.log("Switch off: " + val);
    if (val == 1) {
      gpio.reverseOff();
      gpio.unregisterListener();
      forward();
    }
  });

  gpio.reverseOn();
}

setInterval(function() {
    rundb.findBeforeDate(new Date())
    .then(function(run) {
        if (run !== null) {
            run.done = true;
            rundb.updateRun(run.id.toString(), run)
            .then(function() {
                console.log("Marked " + run.id + " as done.");
                console.log("Start run...");
                
                if (config.debug) {
                    console.log("debug skip");
                    return;
                }
                done = 0;
                forward();
                /*gpio.registerListener(function(val) {
                    console.log("Switch off: " + val);
                    if (val == 1) {
                        gpio.forwardOff();
                        gpio.unregisterListener();
                    }
                });

                gpio.forwardOn();
                setTimeout(function() {
                    console.log("Timeout");
                    gpio.forwardOff();
                    gpio.unregisterListener();
                }, 5000);*/
            });
            
        }
    });
}, 10000);