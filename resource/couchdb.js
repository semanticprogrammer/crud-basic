module.exports = function (env) {
   var 
   util = require('util'),
   self = { 
      database: {},
      document: { model: {}, get: {}}
   }
   
   var cradle = require('cradle');
   var db = new(cradle.Connection)(env.host, env.port).database(env.db);
   
   self.entity = function() {
      return 'document';
   }

   self.open = function(callback) {
      callback();
   }
   
   self.database.create = function() {
      return db.create();
   }
   
   self.database.name = function() {
      return db.name;
   }
   
   self.database.info = function(callback) {
      var data = {};
      data.dbName = db.name;
      data.entity = self.entity();
      data.entityNames = [];
      db.all(function(err, res){
         data.entityNames = res.rows.map(function (row) {
            return row.id
         });
         callback(data);
      })
   }
   self.document.get = function(data, callback) {
      db.get(data.selector, function(err, doc) {
         var _data = {};
         if (err) _data.message = err.message
         else {
            _data.url = '/resource/document/' + doc._id;
            _data.content = doc;                  
         }
         callback(_data);
      })
   }
   
   self.document.model.create = function() {
      return {
         document : {
            json: {}
         }
      }
   }
   
   self.document.get.create = function(name, callback) {
      var data = {};
      data.entity = 'document';
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
      if (data.content.json) {
         data.content = JSON.parse(data.content.json);
      }
      db.save(data.content, function(err, res) {
         console.log('res = ' + util.inspect(res));
         var _data = {};
         if (err) {
            _data.message = err.message;
         }
         else {
            _data.url = '/';
            _data.message = 'Document ' + res._id + ' has created successfully!';
         }
         callback(_data)         
      });
   }
   
   self.document.update = function(data, callback) {
      db.merge(data.selector, data.content, function(err, res) {
         var _data = {};
         if (err) _data.message = err.message
         else {
            _data.url = '/';
            _data.message = 'Document ' + 
            data.selector + ' has updated successfully!';                  
         }
         callback(_data);         
      })
   }
   
   self.document['delete'] = function(data, callback) {
      db.get(data.selector, function (err, res) {
         db.remove(data.selector, res.rev, function (err, res) {
            var _data = {};
            if (err) {
               _data.message = err.message;
               callback(_data);
            }
            else {
               _data.message = 'Document ' + data.selector + ' has deleted successfully!';
               callback(_data);
            }
         })
      })      
   }

   return self;
}