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
      resource.database.info(function(data) {
         res.render('main', data);
      });
   }
},
{
   pattern: '/resource/create/{entity}',
   get: function(req, res) {
      console.log("params = " + util.inspect(req.params));
      resource[req.params.entity].get.create(req.params.entity, function(data){
         res.render('create', data);
      });
   }
},
{
   pattern: '/resource/model/create/{entity}',
   get: function(req, res) {
      resource[req.params.entity].get.create(req.params.entity, function(data){
         res.end(JSON.stringify(data.content));
      });
   }
},
{  // create entity
   pattern: '/resource/{entity}',
   post: function(req, res) {
      var postData = JSON.parse(req.postdata.toString());
      resource[req.params.entity].create(postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{
   pattern: '/resource/update/{entity}/{selector}',
   get: function(req, res) {
      resource[req.params.entity].get.update(req.params.selector,
         function(data){
            res.render('update', data);
         });
   }
},
{
   pattern: '/resource/model/update/{entity}/{selector}',
   get: function(req, res) {
      resource[req.params.entity].get.update(req.params.selector, function(data) {
         res.end(JSON.stringify(data.content));
      });
   }
},
{  // update entity
   pattern: '/resource/{entity}',
   put: function(req, res) {
      var postData = JSON.parse(req.postdata.toString());
      resource[req.params.entity].update(postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{  // delete entity
   pattern: '/resource/{entity}',
   'delete': function(req, res) {
      var postData = JSON.parse(req.postdata.toString());
      resource[req.params.entity]['delete'](postData, function(data) {
         res.end(JSON.stringify(data));
      })
   }
},
{  // resource list
   pattern: '/resource/list/{name}',
   get: function(req, res) {
      resource.list(req.params.name, function(data) {
         templateResource.onLoad(function(name, callback) {
            data.forEachAttr = templateResource.forEachAttr;
            res.render('list', data);
         });
         res.render(req.params.name + '_list', data, function(err, out) {
            if (err) console.log(err.message)
            else console.log(out);
         });
      })
   }
},
{
   pattern: '/resource/item/create/{entity}',
   get: function(req, res) {
      templateResource.onLoad(function(name, callback) {
         resource.item.get.create(req.params.entity, function(data){
            res.render('create', data);
         });
      });
      var data = {};
      data.name = req.params.entity;
      res.render(req.params.entity + '_create', data);
   }
},
{
   pattern: '/resource/model/create/item/{name}',
   get: function(req, res) {
      resource.item.get.create(req.params.name, function(data){
         res.end(JSON.stringify(data.content));
      });
   }
},
{
   pattern: '/resource/item/update/{name}/{selector}',
   get: function(req, res) {
      var selector = JSON.parse(unescape(req.params.selector));
      resource.find(req.params.name, selector, function(err, data) {
         if (err) {
            res.end(err.message);
         }
         else {
            res.render(req.params.name + '_update', data);
         }
      });
   }
},
{  // read resource
   pattern: '/resource/{name}/{key}/{id}',
   get: function(req, res) {
      var selector = {};      
      selector[req.params.key] = req.params.id;
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