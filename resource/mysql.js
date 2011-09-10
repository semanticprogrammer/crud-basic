module.exports = function (env) {
   var mysql = require('mysql'),
   self = { 
      database: {},
      table: { model: {}, get: {}},
      record: { model: {}, get: {}}
   }

   var client = mysql.createClient({
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      database: env.db
   });

   self.entity = function() {
      return 'table';
   }
   
   self.open = function(callback) {
      return callback();
   }

   self.database.name = function() {
      return client.database;
   }
   
   self.database.info = function(callback) {
      var data = {}, prop;
      data.dbName = client.database;
      data.entity = self.entity();
      data.entityNames = [];
      client.query("SHOW TABLES", function(err, names) {
         names.forEach(function(element) {
            if (!prop) prop = Object.keys(element)[0];
            data.entityNames.push(element[prop]);
         });
         callback(data)
      });      
   }

   self.table.create = function(data, callback) {
      return client.query('CREATE TABLE ' + unescape(data.name) + ' ...', callback)
   }
   
   self.table['delete'] = function(name, callback) {
      client.query('DROP TABLE ' + name, callback);
   }  

   self.entityNames = function(collectionName, callback) {
      return db.collectionNames(collectionName, callback)
   };
   
   self.entityShortNames = function(callback) {
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
   }

   self.collectionInfo = function(collectionName, callback) {
      db.collectionsInfo(collectionName, function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);        
         });
      })
   }

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
   }

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
   }

   self.record.create = function(data, callback) {
      client.query('....', callback);
   }

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
   }

   self.remove = function(collectionName, selector, callback) {
      db.collection(collectionName, function(err, collection) {
         if (err) {            
            callback(err);
         }
         else {
            collection.remove(selector, function() {
               callback();
            });
         }
      })
   }

   self.renameCollection = function(fromCollection, toCollection, callback) {
      return db.renameCollection(unescape(fromCollection), unescape(toCollection), callback)
   }
   
   return self;
}