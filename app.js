require.paths.unshift('../../lib');
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
   hostname: '10.0.1.243', 
   port:3000, 
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
Server = require('mongodb').Server,
BSON = require('mongodb').BSONNative;

var db = new Db(env.data.db, new Server(env.data.host, env.data.port, {}));

var router_data = [
   {
      pattern: '/hello',
      get: function(req, res) {
         res.end('Hello World!');
      }
   },
   {
      pattern: '/',
      get: function(req, res) {
         res.redirect('/main');
      }
   },
   {
      pattern: '/main',
      get: function(req, res) {
         resource.getArray(db, 'posts', function(err, data) {
            if (err) {
               res.end('<h3>Collection Posts is not available</h3>');  
            }
            else {
               var ctx = {};
               ctx.posts = data;
               res.render('main', ctx);
            }
         })
      }
   },
   {
      pattern: '/posts',
      get: function(req, res) {
         resource.getArray(db, 'posts', function(err, data) {
            if (err) {
               res.end('<h3>Collection Posts is not available</h3>');  
            }
            else {
               var ctx = {};
               ctx.posts = data;
               res.render('posts', ctx);
            }
         })
      }
   },
   {
      pattern: '/posts/add',
      get: function(req, res) {
         res.render('add_post', {});
      }
   },
   {
      pattern: '/posts/{id}/edit',
      get: function(req, res) {
         resource.find(db, 'posts', {'key': req.params.id}, function(err, data) {
            if (err) {
               res.end(err.toString());
            }
            else {
               res.render('edit_post', data);
            }
         });
      }
   },
   {
      pattern: '/posts',
      post: function(req, res) {
         var postData = qs.parse(req.postdata.toString());
         resource.add(db, 'posts', postData, function(err, data) {
            if (err) {
               res.end('<h3>Collection Posts is not available</h3>');  
            }
            else {
               res.redirect('/posts');
            }
         })         
      }
   },
   {
      pattern: '/posts/{id}',
      put: function(req, res) {
         var postData = JSON.parse(req.postdata.toString());
         resource.update(db, 'posts', {'key': req.params.id}, postData, function(err, data) {
            if (err) {
               res.end(err.toString());
            }
            else {
               res.redirect('/posts');
            }
         })
      }
   },
   {
      pattern: '/posts/{id}',
      delete: function(req, res) {
         resource.remove(db, 'posts', req.params.id, function(err) {
            if (err) {
               res.end(err.toString());
            }
            else {
               resource.getArray(db, 'posts', function(err, data) {
                  if (err) {
                     res.end('<h3>Collection Posts is not available</h3>');  
                  }
                  else {
                     var ctx = {};
                     ctx.posts = data;
                     res.render('main', ctx);
                  }
               })
            }
         })      
      }
   },
   {
      pattern: '/view/{templatename}',
      get: function(req, res) {
         try {
            res.render(req.params.templatename, data);
         } catch (e) {
            res.end(e.message);
         }
      }
   },
   {
      pattern: '/{app},<name>,{template}',
      get: function(req, res) {
         try {
            if (dust.cache[req.params.template]) {
               resource.pageModel(db, req.params.app, req.params.name, function(data) {
                  res.render(req.params.template, data);
               });
            }
            else {
               resource.createTemplate(req.params.template, opts.template, function(err) {
                  if (err) {
                     res.end(err);
                  };
                  resource.pageModel(db, req.params.app, req.params.name, function(data) {
                     res.render(req.params.template, data);
                  });
               })
            }
         } catch (e) {
            res.end(e.message);
         }
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
   router.plug(
   function get(req, res) {
      res.setNotFoundStatus();
      res.end('<h3>Resource Not Found</h3><pre>' + req.params.pathname + '</pre>');
   }
);
   opts.app = app(router);
   db.open(function(err, db) {
      prepareApp.prepareTemplates(opts.view, callback);
   });   
}

start(function () {
   server.run(opts);
   console.log('listening on host: ' + opts.hostname + ' port: ' + opts.port);
});