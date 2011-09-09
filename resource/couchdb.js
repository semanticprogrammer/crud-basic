module.exports = function (env) {
   var 
   util = require('util'),
   self = {};
   self.database = {};
   self.document = {};
   self.document.model = {};
   self.document.get = {};
   
   var cradle = require('cradle');
   var db = new(cradle.Connection)(env.host, env.port).database(env.db);
   
   self.entity = function() {
      return 'document';
   }

   self.open = function(callback) {
      callback();
   }
   
   self.document.model.create = function() {
      return {
         item : {
            json: {}
         }
      }
   }
   
   self.document.get.create = function(name, callback) {
      var data = {};
      data.entity = 'document';
      data.name = name;
      data.content = {};
      data.content = self.document.model.create();
      callback(data)
   }
   
//   self.document.create = function(id, obj, callback) {
//      obj = obj || id;
//      if (arguments.length == 3) {
//         db.save(id, obj, callback);
//      }
//      else 
//         db.save(obj, callback);
//   }
   self.document.create = function(data, callback) {
      client.collection(data.name, function(err, collection) {
         if (err) {
            callback(err);
         }
         else {
            if (data.content.json) {
               data.content = JSON.parse(data.content.json);
            }
            db.save(data.content, function(err, obj) {               
               var _data = {};
               if (err) {
                  _data.message = err.message;
               }
               else {
                  _data.url = '/resource/list/' + collection.collectionName;
                  _data.message = 'Item ' + collection.collectionName + ' has created successfully!';
               }
               callback(_data)
            });
         }
      })
   }
   
   self.document.update = function(data, callback) {
      client.collection(data.name, function(err, collection) {
         var _data = {};
         if (err) {
            _data.message = err.message;
            callback(_data);
         }
         else {
            collection.findAndModify(data.selector, [], {
               $set: data.content
            }, {}, function(err, object) {
               if (err) _data.message = err.message
               else {
                  _data.url = '/resource/list/' + collection.collectionName;
                  _data.message = collection.collectionName + ' ' + 
                  JSON.stringify(data.selector) + ' has updated successfully!';                  
               }
               callback(_data);
            });
         }
      })
   }
   
   self.document['delete'] = function(data, callback) {      
      db.remove(data.selector, function(err, obj) {
         var _data = {};
         if (err) {
            _data.message = err.message;
            callback(_data);
         }
         else {
            _data.message = data.name + ' ' + JSON.stringify(data.selector) + ' has deleted successfully!';               
               callback(_data);
         }
      })
   };

   self.database.name = function() {
      return db.name;
   }
   
   self.database.info = function(callback) {
      var data = {};
      data.dbName = db.name;
      data.entity = self.entity();
      data.entityNames = [];
      db.all(function(err, res){
         var rowRead = 0;
         res.forEach(function(row1, row2) {
            rowRead += 1;
            data.entityNames.push(row1);
            if (res.length === rowRead && callback) {
               callback(data);
            }
         });
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

   self.add = function(collectionName, postData, callback) {
      db.save(collectionName, postData, callback);
   }
   
   return self;
}