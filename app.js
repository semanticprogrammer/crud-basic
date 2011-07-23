//require.paths.unshift('../../lib');
var 
fs = require('fs'),
qs = require('querystring'),
connect = require('connect'),
router = require('mutant/lib/router').router,
app = require('mutant/lib/app').app,
server = require('mutant/lib/server'),
dust = require('dust'),
util = require('util'),
prepareApp = require('./prepare-app'),
resource = require('./resource');

var env = JSON.parse(fs.readFileSync('./config/environment.js', 'utf-8'));

var opts = {
   hostname: env.app.hostname,
   port: env.app.port,
   view: {
      dir: env.view.area,
      ext: env.view.ext,
      compileFunc: dust.compile,
      loadFunc: dust.loadSource,
      renderFunc: dust.render
   },
   template: {
      dir: env.template.area,
      ext: env.template.ext,
      compileFunc: dust.compile,
      loadFunc: dust.loadSource,
      renderFunc: dust.render
   }
};

var Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;

var db = new Db(env.data.db, new Server(env.data.host, env.data.port, {}));

var router_data = [
   {
      pattern: '/',
      get: function(req, res) {
         res.redirect('/main');
      }
   },
   {
      pattern: '/main',
      get: function(req, res) {
         res.render('main');
      }
   },
   {
      pattern: '/resource/add/{name}',
      get: function(req, res) {
         res.render(req.params.name + '_add');
      }
   },
   {
      pattern: '/resource/edit/{name}/{key}/{id}',
      get: function(req, res) {
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.find(db, req.params.name, selector, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.render(req.params.name + '_edit', data);
            }
         });
      }
   },
   {  // resource list
      pattern: '/resource/list/{name}',
      get: function(req, res) {
         resource.getArray(db, req.params.name, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.render(req.params.name + '_list', data);
            }
         })
      }
   },
   {  // read resource
      pattern: '/resource/{name}/{key}/{id}',
      get: function(req, res) {
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.find(db, req.params.name, selector, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.render('read_post', data);
            }
         });
      }
   },   
   {  // create resource
      pattern: '/resource/{name}',
      post: function(req, res) {
         var postData = qs.parse(req.postdata.toString());
         resource.add(db, req.params.name, postData, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.redirect('/resource/list/' + req.params.name);
            }
         })
      }
   },
   {  // update resource
      pattern: '/resource/{name}/{key}/{id}',
      put: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.update(db, req.params.name, selector, postData, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.redirect('/resource/list/' + req.params.name);
            }
         })
      }
   },
   {  // delete resource
      pattern: '/resource/{name}/{key}/{id}',
      delete: function(req, res) {
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.remove(db, req.params.name, selector, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               resource.getArray(db, req.params.name, function(err, data) {
                  if (err) {
                     res.end(err.message);  
                  }
               })
            }
         })      
      }
   },   
   {
      get: connect.static(env.staticArea)
   }
];

function start(callback) {
   dust.optimizers.format = function(ctx, node) {
      return node
   };
   console.log("Connecting to " + env.data.host + ":" + env.data.port);
   router = router(router_data);
   router.use(function(req, res, next) {
      res.render = function (templatename, data) {
         opts.template.renderFunc(templatename, data, function (err, output) {
            if (err) {
               throw err;
            }
            res.end(output);
         });
      };
      next();
   });
   router.plug(function get(req, res) {
      res.setNotFoundStatus();
      res.end('<h3>Resource Not Found</h3><pre>' + req.params.pathname + '</pre>');
   });
   opts.app = app(router);
   db.open(function(err, db) {
      prepareApp.prepareTemplates(opts.view, callback);
   });   
}

start(function () {
   server.run(opts);
   console.log('listening on host: ' + opts.hostname + ' port: ' + opts.port);
});