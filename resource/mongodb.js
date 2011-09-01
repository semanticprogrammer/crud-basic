module.exports = function (env) {
   var 
   util = require('util'),
   self = {};
   self.database = {};
   self.collection = {};
   self.collection.model = {};
   self.collection.get = {};
   self.item = {};
   self.item.model = {};
   self.item.get = {};

   var Db = require('mongodb').Db,
   Connection = require('mongodb').Connection,
   Server = require('mongodb').Server;

   var client = new Db(env.db, new Server(env.host, env.port, {}));

   self.entity = function() {
      return 'collection';
   }
   
   self.open = function(callback) {
      client.open(function(error, client) {
         if (error) {
            callback(error)
         }
         else {
            if (env.user && env.password) {
               client.authenticate(env.user, env.password, function(err, replies) {
                  if (err) {
                     callback(err)
                  }
                  else callback(null, replies);
               })               
            }
            else {
               callback(null, client);
            }            
         }
      })
   }
   
   //   self.collection = function(collectionName, options, callback) {
   //      return client.collection(collectionName, options, callback)
   //   };
   
   self.collection.model.create = function() {
      return {
         collection : {
            name: ''
         }
      }
   }
   
   self.collection.get.create = function(name, callback) {
      console.log("collection.get.create = " + util.inspect(name));
      var data = {};
      data.entity = self.entity();
//      data.name = name;
      data.content = {};
      data.content = self.collection.model.create();
      callback(data)
   }
   
   self.collection.model.update = function() {
      return {
         collection : {
            from: '',
            to: ''
         }
      }
   }
   
   self.collection.get.update = function(from, callback) {
      var data = {};
      data.entity = self.entity();
      data.name = from;
      data.content = {};
      data.content = self.collection.model.update();
      data.content.collection.from = from;
      callback(data)
   }   
   
   self.collection.create = function(data, callback) {
      return client.createCollection(unescape(data.content.name), callback)
   }
   
   self.collection['delete'] = function(data, callback) {
      client.collection(data.selector, function(err, collection) {
         collection.drop(function(err) {
            callback(err)
         })
      })
   }

   self.collection.update = function(data, callback) {
      return client.renameCollection(unescape(data.from), unescape(data.to), callback)
   }
   
   self.collection.names = function(name, callback) {
      return client.collectionNames(name, callback)
   }
   
   self.collection.shortNames = function(callback) {
      var nameList = [], re = new RegExp("^" + client.databaseName + ".");
      client.collectionNames(function(err, names) {
         names.forEach(function(element) {
            nameList.push(element.name.replace(re, ""));
         });
         callback(nameList)
      });
   }
   
   self.database.name = function() {
      return client.databaseName;
   }
   
   self.database.info = function(callback) {
      var data = {}, re = new RegExp("^" + client.databaseName + ".");
      data.dbName = client.databaseName;
      data.entity = self.entity();
      data.entityNames = [];
      client.collectionNames(function(err, names) {
         names.forEach(function(element) {
            data.entityNames.push(element.name.replace(re, ""));
         });
         callback(data)
      });      
   }
   
   self.database.lastStatus = function(callback) {
      return client.lastStatus(callback)
   }
   
   self.database.drop = function(callback) {
      return client.dropDatabase(callback)
   }   
   
   self.collectionsInfo = function(callback) {
      client.collectionsInfo(function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);
         });
      })   
   }

   self.collectionInfo = function(collectionName, callback) {
      client.collectionsInfo(collectionName, function(err, cursor) {
         cursor.toArray(function(err, items) {
            callback(items);        
         });
      })
   }

   self.list = function(collectionName, callback) {
      client.collection(collectionName, function(err, collection) {
         if (err) {
            console.log("!!!!!!!!! db is ...." + util.inspect(client));
            console.log("!!!!!!!!! err is ...." + util.inspect(err));
            console.log("!!!!!!!!! db state is ...." + util.inspect(client.state));
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
      client.collection(collectionName, function(err, collection) {
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

   self.item.model.create = function() {
      return {
         item : {
            json: {}
         }
      }
   }
   
   self.item.get.create = function(name, callback) {
      var data = {};
      data.entity = 'item';
      data.name = name;
      data.content = {};
      data.content = self.item.model.create();
      callback(data)
   }
   
   self.item.create = function(data, callback) {
      client.collection(data.name, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            data.content.json = JSON.parse(data.content.json);
            collection.insert(data.content.json, {
               safe:true
            }, function(err, object) {
               if (err) callback(err)
               else callback(err, object);
            });
         }
      })
   }
   
   self.item.update = function(collectionName, selector, postData, callback) {
      client.collection(collectionName, function(err, collection) {
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
   
   self.item['delete'] = function(data, callback) {      
      client.collection(data.name, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            collection.remove(data.selector, function() {
               callback();
            });
         }
      })
   };
   return self;
}