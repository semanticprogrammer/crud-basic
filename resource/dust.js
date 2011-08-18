module.exports = function (env) {
   var
   fs = require('fs'),
   path = require('path'),
   dust = require('dust'),
   self = {};

   dust.optimizers.format = function(ctx, node) {
      return node
   };
   
   self.render = function (templatename, data, callback) {
      return dust.render(templatename, data, callback);
   };
   
   self.onLoad = function(fn) {
      dust.onLoad = fn;
   }
   
   self.prepareTemplates = function (folderName, ext, callback) {      
      console.log(folderName);
      fs.readdir(folderName, function (err, filenames) {
         if (err) {
            throw err;
         }
         var filesRead = 0;
         var templateName, pattern = new RegExp('\\' + ext + '$');
         filenames.forEach(function (filename) {
            if (pattern.test(filename)) {
               fs.readFile(path.join(folderName, filename), function (err, data) {
                  if (err) {
                     throw err;
                  }
                  templateName = filename.replace(pattern, '');
                  dust.loadSource(dust.compile(data.toString(), templateName));
                  console.log("'" + filename + "' template prepared.");
                  filesRead += 1;
                  if (filenames.length === filesRead && callback) {
                     callback();
                  }
               });
            }
         });
      });
   };   
   
   self.createTemplate = function(templateName, callback) {
      var templatePath = path.join(env.dir, templateName + env.ext);
      try {
         fs.readFile(templatePath, function (err, data) {
            if (err) {
               throw err;
            }
            console.log(require('util').inspect(data.toString(), true, null));
            dust.loadFunc(dust.compileFunc(data.toString(), templateName));
            console.log("'" + templateName + "' template created.");
            callback();
         });
      } catch (e) {
         console.log(e.message);
      }
   };

   self.forEachAttr = function(chk, ctx, bodies, params) {
      var obj = ctx.current();
      for (var k in obj) {
         if (typeof obj[k] != "object" && k != "content") {
            chk = chk.render(bodies.block, ctx.push({
               key: k, 
               value: obj[k],
               indent: (params && params.indent != null) ? params.indent : ""
            }));         
         }
      }
      return chk;
   };

   self.forEachObject = function(chk, ctx, bodies, params) {
      var obj = ctx.current();
      for (var k in obj) {
         if (typeof obj[k] == "object" && k != "_") {
            chk = chk.render(bodies.block, ctx.push({
               key: k, 
               obj: obj[k],
               indent: (params && params.indent != null) ? params.indent : ""            
            }));         
         }
      }
      return chk;
   };

   return self;
}