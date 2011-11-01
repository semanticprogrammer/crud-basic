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
   middleware: function(req, res, next) {
      res.render = function (templatename, data) {
         templateResource.render(templatename, data, function (err, output) {
            if (err) {
               res.end(err.message);
            }
            res.end(output);
         });
      };
      next();         
   }
},
{
   pattern: '/view/db',
   get: function(req, res) {
      resource.database.info(function(data) {
         data.forEachAttr = templateResource.forEachAttr;
         res.render(env.resource.db, data);
      });
   }
},
{  // resource list
   pattern: '/view/list/{name}',
   get: function(req, res) {
      resource.list(req.params.name, function(data) {
         templateResource.onLoad(function(name, callback) {
            data.forEachAttr = templateResource.forEachAttr;
            res.render('list', data);
         });
         res.render(req.params.name + '-list', data, function(err, out) {
            if (err) console.log(err.message)
            else console.log(out);
         });
      })
   }
},
{
   pattern: '/view/create/{entity}',
   get: function(req, res) {
      resource[req.params.entity].get.create(req.params.query, function(data){
         templateResource.onLoad(function(name, callback) {
            res.render('create', data);
         });
         res.render(req.params.query.context + '-create', data, function(err, out) {
            if (err) console.log(err.message)
            else console.log(out);
         });
      });
   }
},
{
   pattern: '/resource/model/create/{entity}',
   get: function(req, res) {
      resource[req.params.entity].get.create(req.params.query, function(data) {
         res.end(JSON.stringify(data));
      });
   }
},
{
   pattern: '/view/update/{entity}',
   get: function(req, res) {
      resource[req.params.entity].get.update(req.params.query, function(data){
         templateResource.onLoad(function(name, callback) {
            res.render('update', data);
         });
         res.render(req.params.query.context + '-update', data, function(err, out) {
            if (err) console.log(err.message)
            else console.log(out);
         });
      });
   }
},
{
   pattern: '/resource/model/update/{entity}',
   get: function(req, res) {
      resource[req.params.entity].get.update(req.params.query, function(data) {
         res.end(JSON.stringify(data));
      });
   }
},
{  // create entity
   pattern: '/resource/{entity}',
   post: function(req, res) {
      var postData = JSON.parse(unescape(req.postdata));
      resource[req.params.entity].create(postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{  // update entity
   pattern: '/resource/{entity}',
   put: function(req, res) {
      var postData = JSON.parse(unescape(req.postdata));
      resource[req.params.entity].update(postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{  // delete entity
   pattern: '/resource/{entity}',
   'delete': function(req, res) {
      var postData = JSON.parse(unescape(req.postdata));
      resource[req.params.entity]['delete'](postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{
   middleware: connect.static(__dirname + "/" + env.static.area)
},
{
   resourceNotFound: function get(req, res) {
      res.setNotFoundStatus();
      res.end('<h3>Resource Not Found</h3><pre>' + req.params.pathname + '</pre>');
   }
}
];

function start(callback) {
   console.log("Connecting to DB Server: " + db_env.host + ":" + db_env.port);
   router = router(router_data);
   env.app.handler = handler(router);
   resource.open(function(err, db) {
      templateResource.prepareTemplates(__dirname + "/" + env.view.area, env.view.ext, callback);
   });   
}

start(function () {
   server.run(env.app);
   console.log('listening on host: ' + env.app.hostname + ' port: ' + env.app.port);
});