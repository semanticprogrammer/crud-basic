var 
fs = require('fs'),
qs = require('querystring'),
connect = require('connect'),
router = require('mutant/lib/router').router,
handler = require('mutant/lib/handler').handler,
server = require('mutant/lib/server'),
util = require('util');

var env = require('./config/environment.json', 'utf-8');
var db_env = require('./config/' + env.resource.db + '.json', 'utf-8');

var resource = require('./resource/' + env.resource.db)(db_env);
var templateResource = require('./resource/' + env.resource.template)();

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
      pattern: '/resource/collection',
      post: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.createCollection(postData.name, function(err, collection) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + postData.name + " has created successfully!");
            }            
         })
      }
   },
   {  // delete collection
      pattern: '/resource/collection',
      delete: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.deleteCollection(postData.name, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + postData.name + " has deleted successfully!");
            }            
         })
      }
   },
   {  // rename collection
      pattern: '/resource/collection',
      put: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.renameCollection(postData.from, postData.to, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Collection " + postData.from + " renamed to " + postData.to + " successfully!");
            }            
         })
      }
   },   
   {
      pattern: '/resource/add/{name}',
      get: function(req, res) {
         var data = {}; data.name = req.params.name;
         templateResource.onLoad(function(name, callback) {
            res.render('add', data);
         });
         res.render(req.params.name + '_add', data);
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
               var _data = {};
               _data.data = data;
               _data.resourceName = req.params.name;
               templateResource.onLoad(function(name, callback) {
                  res.render('list', _data);
               });
               res.render(req.params.name + '_list', _data, function(err, out) {
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
      pattern: '/resource/item',
      post: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.add(postData.collection, postData.content, function(err, data) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end(postData.collection + " created successfully!");
            }
         })
      }
   },
   {  // update resource
      pattern: '/resource/item',
      put: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.update(postData.name, postData.selector, postData.content, function(err, data) {
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
      pattern: '/resource/item',
      delete: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.remove(postData.name, postData.selector, function(err) {
            if (err) {
               res.end(err.message);
            }
            else {
               res.end("Resource " + JSON.stringify(postData.selector) + " Deleted Successfully!");
            }
         })      
      }
   },
//   {  // delete resource
//      pattern: '/resource/{id}',
//      delete: function(req, res) {
//         resource.remove(req.params.id, function(err, data) {
//            if (err) {
//               res.end(err.message);
//            }
//            else {
//               res.end("Resource " + req.params.id + " Deleted Successfully!");
//            }
//         })      
//      }
//   },   
   {
      get: connect.static(__dirname + "/" + env.static.area)
   }
];

function start(callback) {
   console.log("Connecting to DB Server: " + db_env.host + ":" + db_env.port);
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
   env.app.handler = handler(router);
   resource.open(function(err, db) {
      templateResource.prepareTemplates(__dirname + "/" + env.view.area, env.view.ext, callback);
   });   
}

start(function () {
   server.run(env.app);
   console.log('listening on host: ' + env.app.hostname + ' port: ' + env.app.port);
});