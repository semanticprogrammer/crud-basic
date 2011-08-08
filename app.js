var 
fs = require('fs'),
qs = require('querystring'),
connect = require('connect'),
router = require('mutant/lib/router').router,
app = require('mutant/lib/app').app,
server = require('mutant/lib/server'),
util = require('util');

var env = require('./config/environment.json', 'utf-8');

var opts = {
   hostname: env.app.hostname,
   port: env.app.port,
   view: {
      dir: env.view.area,
      ext: env.view.ext
   }
};

var resource = require(env.data.resource)(env.data);
var templateResource = require(env.template.resource)();

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
         resource.databaseInfo(function(data) {
            res.render('main', data);
         });
      }
   },
   {  // create collection
      pattern: '/resource/createcollection/{name}',
      post: function(req, res) {
         resource.createCollection(req.params.name, function(err, collection) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + req.params.name + " has created successfully!");
            }            
         })
      }
   },
   {  // delete collection
      pattern: '/resource/deletecollection/{name}',
      delete: function(req, res) {
         resource.deleteCollection(req.params.name, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + req.params.name + " has deleted successfully!");
            }            
         })
      }
   },
   {  // rename collection
      pattern: '/resource/renamecollection/{from}/{to}',
      put: function(req, res) {
         resource.renameCollection(req.params.from, req.params.to, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + req.params.from + " renamed to " + req.params.to + " successfully!");
            }            
         })
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
         resource.find(req.params.name, selector, function(err, data) {
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
         resource.list(req.params.name, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.render(req.params.name + '_list', data, function(err, out) {
                  if (err) console.log(err.message)
                  else console.log(out);
               });
            }
         })
      }
   },
   {  // read resource
      pattern: '/resource/{name}/{key}/{id}',
      get: function(req, res) {
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.find(req.params.name, selector, function(err, data) {
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
         resource.add(req.params.name, postData, function(err, data) {
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
         resource.update(req.params.name, selector, postData, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Update Successful!");
            }
         })
      }
   },
   {  // delete resource
      pattern: '/resource/{name}/{key}/{id}',
      delete: function(req, res) {
         var selector = {}; selector[req.params.key] = req.params.id;
         resource.remove(req.params.name, selector, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Resource " + req.params.id + " Deleted Successfully!");
            }
         })      
      }
   },   
   {
      get: connect.static(env.staticArea)
   }
];

function start(callback) {
   console.log("Connecting to " + env.data.host + ":" + env.data.port);
   router = router(router_data);
   router.use(function(req, res, next) {
      res.render = function (templatename, data) {
         templateResource.render(templatename, data, function (err, output) {
            if (err) {
               res.end(err.message);
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
   resource.open(function(err, db) {
      templateResource.prepareTemplates(opts.view, callback);
   });   
}

start(function () {
   server.run(opts);
   console.log('listening on host: ' + opts.hostname + ' port: ' + opts.port);
});