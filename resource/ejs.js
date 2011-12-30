module.exports = function (env) {
   var
   fs = require('fs'),
   path = require('path'),
   client = require('ejs');
   
   var cache = {},
   self = {};
   
   self.clearCache = function(){
      cache = {};
   }

   self.templateExists = function(templateName, callback) {
      var templatePath = path.join(env.path, templateName + env.ext);
      var str = cache[templatePath];
      if (str) return callback(true);
      path.exists(templatePath, function(exists) {
         callback(exists);
      })
   }
   
   function read(path, options, callback) {
      var str = cache[path];
      if (options.cache && str) return callback(null, str);
      fs.readFile(path, 'utf8', function(err, str) {
         if (err) return callback(err);
         if (options.cache) cache[path] = str;
         callback(null, str);
      });
   }

   self.render = function(templateName, data, callback) {
      var templatePath = path.join(env.path, templateName + env.ext);
      read(templatePath, data, function(err, str) {
         if (err) return callback(err);
         try {
            data.filename = templatePath;
            var tmpl = client.compile(str, data);
            callback(null, tmpl(data));
         } catch (err) {
            callback(err);
         }
      })
   }

   return self;
}