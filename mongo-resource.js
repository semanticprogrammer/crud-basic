module.exports = function (env) {
   var 
   util = require('util'),
   self = {};

   var Db = require('mongodb').Db,
   Connection = require('mongodb').Connection,
   Server = require('mongodb').Server;

   var db = new Db(env.db, new Server(env.host, env.port, {}));

   self.open = function(callback) {
      return db.open(callback);
   };

   self.collection = function(collectionName, options, callback) {
      return db.collection(collectionName, options, callback)
   };
   
   self.createCollection = function(collectionName, options, callback) {
      return db.createCollection(unescape(collectionName), options, callback)
   };

   self.collectionNames = function(collectionName, callback) {
      return db.collectionNames(collectionName, callback)
   };
   
   self.collectionShortNames = function(callback) {
      var nameList = [], re = new RegExp("^" + db.databaseName + ".");
      db.collectionNames(function(err, names) {
         names.forEach(function(element) {
            nameList.push(element.name.replace(re, ""));
         });
         callback(nameList)
      });      
   };

   self.collectionsInfo = function(callback) {
      db.collectionsInfo(function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);
         });
      })   
   };

   self.collectionInfo = function(collectionName, callback) {
      db.collectionsInfo(collectionName, function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);        
         });
      })
   };

   self.list = function(collectionName, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {
            console.log("!!!!!!!!! db is ...." + util.inspect(db));
            console.log("!!!!!!!!! err is ...." + util.inspect(err));
            console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
            callback(err, false);
         }
         else {
            collection.find().toArray(function(err, docs) {
               callback(err, docs);
            });
         }
      })
   };

   self.find = function(collectionName, selector, callback) {
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

   self.add = function(collectionName, postData, callback) {
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

   self.update = function(collectionName, selector, postData, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            collection.findAndModify(selector, [], {
               $set: postData
            }, {}, function(err, object) {
               if (err) callback(err)
               else callback(err, object);
            });
         }
      })
   };

   self.remove = function(collectionName, selector, callback) {
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

   self.rename = function(fromCollection, toCollection, callback) {
      return db.renameCollection(unescape(fromCollection), unescape(toCollection), callback)
   };
   
   return self;
}