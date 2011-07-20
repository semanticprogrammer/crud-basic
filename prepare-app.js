var fs = require('fs'),
path = require('path');

exports.prepareTemplates = function (opts, callback) {
   fs.readdir(opts.dir, function (err, filenames) {
      if (err) {
         throw err;
      }
      var filesRead = 0;
      var templateName, pattern = new RegExp('\\' + opts.ext + '$');
      filenames.forEach(function (filename) {
         if (pattern.test(filename)) {
            fs.readFile(path.join(opts.dir, filename), function (err, data) {
               if (err) {
                  throw err;
               }
               templateName = filename.replace(pattern, '');
               opts.loadFunc(opts.compileFunc(data.toString(), templateName));
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