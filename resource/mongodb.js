module.exports = function (env) {
   var 
   util = require('util'),
   self = { 
      database: {},
      collection: {
         model: {}, 
         get: {}
      },
      item: {
         model: {}, 
         get: {}
      }
   }

   var Db = require('mongodb').Db,
   Connection = require('mongodb').Connection,
   Server = require('mongodb').Server;

   var client = new Db(env.db, new Server(env.host, env.port, {}));
   
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

   self.database.name = function() {
      return client.databaseName;
   }

   self.database.lastStatus = function(callback) {
      return client.lastStatus(callback)
   }
   
   self.database.drop = function(callback) {
      return client.dropDatabase(callback)
   }   

   self.database.info = function(callback) {
      var data = {}, re = new RegExp("^" + client.databaseName + ".");
      data.dbName = client.databaseName;
      data.entityNames = [];
      client.collectionNames(function(err, names) {
         names.forEach(function(element) {
            data.entityNames.push(element.name.replace(re, ""));
         });
         callback(data)
      });      
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

   //   self.collection = function(collectionName, options, callback) {
   //      return client.collection(collectionName, options, callback)
   //   };
   
   self.collection.model.create = function() {
      return {
         url: '/resource/collection',
         form: {
            collection : {
               name: ''
            }
         }
      }
   }
   
   self.collection.get.create = function(query, callback) {
      var data = self.collection.model.create();
      callback(data)
   }
   
   self.collection.model.update = function() {
      return {
         url: '/resource/collection',
         form: {
            collection : {
               from: '',
               to: ''
            }
         }
      }
   }
   
   self.collection.get.update = function(query, callback) {
      var data = self.collection.model.update();
      data.form.collection.from = query.selector;
      callback(data)
   }
   
   self.collection.create = function(data, callback) {
      client.createCollection(unescape(data.content.name), function(err, collection) {
         var _data = {};
         if (err) {
            _data.message = err.message;
         }
         else {
            _data.url = '/';
            _data.message = 'Collection ' + collection.collectionName + ' has created successfully!';
         }
         callback(_data)
      });
   }
   self.collection.update = function(data, callback) {
      client.renameCollection(data.content.from, data.content.to, function(err, reply) {
         var _data = {};
         if (err) {
            _data.message = err.message;
         }
         else {
            _data.url = '/';
            _data.message = 'Collection ' + data.content.from + " renamed to " + data.content.to + " successfully!";
         }
         callback(_data)
      });
   }   
   self.collection['delete'] = function(data, callback) {
      client.collection(data.selector, function(err, collection) {
         collection.drop(function(err) {
            var _data = {};
            if (err) {
               _data.message = err.message;
            }
            else {
               _data.message = 'Collection ' + data.selector + ' has deleted successfully!';
            }            
            callback(_data)
         })
      })
   }
   
   self.list = function(name, callback) {
      client.collection(name, function(err, collection) {
         var _data = {};
         if (err) {
            _data.message = err.message;
            callback(_data);
         }
         else {
            collection.find().toArray(function(err, docs) {
               if (err) {
                  _data.message = err.message;
               }
               else {
                  _data.data = docs;
                  _data.name = name;
               }
               callback(_data);
            })
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
         url: '/resource/item',
         form: {
            item : {
               json: {}
            }
         }
      }
   }
   
   self.item.get.create = function(query, callback) {
      var data = {};
      data = self.item.model.create();
      data.context = query.context;
      callback(data)
   }
   
   self.item.create = function(data, callback) {
      client.collection(data.context, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            if (data.content.json) {
               data.content = JSON.parse(data.content.json);
            }
            collection.insert(data.content, {
               safe:true
            }, function(err, object) {               
               var _data = {};
               if (err) {
                  _data.message = err.message;
               }
               else {
                  _data.url = 'view/list/' + data.context;
                  _data.message = 'Item ' + collection.collectionName + ' has created successfully!';
               }
               callback(_data)
            });
         }
      })
   }
   
   self.item.model.update = function() {
      return {
         url: '/resource/item',
         form: {
            item : {}
         }
      }
   }
   
   self.item.get.update = function(query, callback) {
      query.selector = JSON.parse(query.selector);    
      var data = self.item.model.update();
      data.context = query.context;
      client.collection(query.context, function(err, collection) {
         if (err) {
            data.message = err.message;
            callback(data);
         }
         else {
            if (query.selector._id) {
               query.selector._id = new client.bson_serializer.ObjectID(query.selector._id);
            }            
            collection.find(query.selector, function(err, cursor) {
               cursor.nextObject(function(err, doc) {
                  data.form.item = doc;
                  callback(data);
               });
            });
         }
      })
   }

   self.item.update = function(data, callback) {
      client.collection(data.context, function(err, collection) {
         var cbdata = {};
         if (err) {
            cbdata.message = err.message;
            callback(cbdata);
         }
         else {
            if (data.selector._id) {
               data.selector._id = new client.bson_serializer.ObjectID(data.selector._id);
               delete data.content._id;
            }
            if (data.content._id) {
               delete data.content._id;
            }
            collection.update(data.selector, {
               $set: data.content
            }, {
               safe:true
            }, function(err) {
               if (err) cbdata.message = err.message
               else {
                  cbdata.url = '/view/list/' + collection.collectionName;
                  cbdata.message = collection.collectionName + ' ' + 
                  JSON.stringify(data.selector) + ' has updated successfully!';                  
               }
               callback(cbdata);
            });
         }
      })
   }
   
   self.item['delete'] = function(data, callback) {      
      client.collection(data.context, function(err, collection) {
         var _data = {};
         if (err) {
            _data.message = err.message;
            callback(_data);
         }
         else {
            if (data.selector._id) {
               data.selector._id = new client.bson_serializer.ObjectID(data.selector._id);
            }
            collection.remove(data.selector, function() {
               if (err) {
                  _data.message = err.message
               }
               else {
                  _data.message = data.context + ' ' + JSON.stringify(data.selector) + ' has deleted successfully!';
               }
               _data.url = 'view/list/' + data.context;
               callback(_data);
            });
         }
      })
   }
   return self;
}