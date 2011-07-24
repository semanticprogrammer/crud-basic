var fs = require('fs'),
path = require('path');

exports.createTemplate = function(templateName, opts, callback) {
   var templatePath = path.join(opts.dir, templateName + opts.ext);
   try {
      fs.readFile(templatePath, function (err, data) {
         if (err) {
            throw err;
         }
         console.log(require('util').inspect(data.toString(), true, null));
         opts.loadFunc(opts.compileFunc(data.toString(), templateName));
         console.log("'" + templateName + "' template created.");
         callback();
      });
   } catch (e) {
      throw 'template not found';
   }
};

exports.collection = function(db, collectionName, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         console.log("!!!!!!!!! db is ...." + util.inspect(db));
         console.log("!!!!!!!!! err is ...." + util.inspect(err));
         console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
         if (logger) logger.error("Problem with getting collection : '" + collectionName  + "' Error: " + err);
         callback(err, false);
      }
      else {
         callback(err, collection);
      }
   })
};
      
exports.collectionNames = function(db, callback) {
   db.collectionNames(function(err, names) {
      callback(names)
   })
};

exports.collectionsInfo = function(db, callback) {
   db.collectionsInfo(function(err, cursor) {
      cursor.toArray(function(err, items) {
         callback(items);
      });
   })   
};

exports.collectionInfo = function(db, collectionName, callback) {
   db.collectionsInfo(collectionName, function(err, cursor) {
      cursor.toArray(function(err, items) {
         callback(items);        
      });
   })
};

exports.list = function(db, collectionName, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         console.log("!!!!!!!!! db is ...." + util.inspect(db));
         console.log("!!!!!!!!! err is ...." + util.inspect(err));
         console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
         if (logger) logger.error("Problem with getting collection : '" + collectionName  + "' Error: " + err);
         callback(err, false);
      }
      else {
         collection.find().toArray(function(err, docs) {
            callback(err, docs);
         });
      }
   })
};

exports.find = function(db, collectionName, selector, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.find(selector, function(err, cursor) {
            cursor.nextObject(function(err, doc) {            
               callback(err, doc);
            });
         });
      }
   })
};

exports.add = function(db, collectionName, postData, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.insert(postData, {
            safe:true
         }, function(err, object) {
            if (err) callback(err)
            else callback(err, object);
         });
      }
   })
};

exports.update = function(db, collectionName, selector, postData, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.findAndModify(selector, [['key','asc']], {
            $set: postData
         }, {}, function(err, object) {
            if (err) callback(err)
            else callback(err, object);
         });
      }
   })
};

exports.remove = function(db, collectionName, selector, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.remove(selector, function(err) {
            callback(err);
         });
      }
   })
};

exports.rename = function(db, fromCollection, toCollection, callback) {
   db.renameCollection(unescape(fromCollection), unescape(toCollection), 
      function (err, output) {
         if (err) {
            callback(err);
         }
         else {
            callback(err, output);
         }
      }
      );
};