module.exports = function (env) {
   var 
   util = require('util'),
   self = { 
      database: {},
      document: {
         model: {}, 
         get: {}
      }
   }
   
   var cradle = require('cradle');
   var db = new(cradle.Connection)(env.host, env.port).database(env.db);

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
      data.entities = [];
      db.all(function(err, res){
         data.entities = res.rows.map(function (row) {
            console.log('row = ' + util.inspect(row));
            return {id: row.id, value: JSON.stringify(row.value)}
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
         url: '/resource/document',
         form: {
            document : {
               json: {}
            }
         }
      }
   }
   self.document.get.create = function(query, callback) {
      var data = {};
      data = self.document.model.create();
      callback(data)
   }
   self.document.create = function(data, callback) {
      if (data.content.json) {
         data.content = JSON.parse(data.content.json);
      }
      db.save(data.content, function(err, res) {
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
   
   
   self.document.model.update = function() {
      return {
         url: '/resource/document',
         form: {
            document: {}
         }
      }
   }
   
   self.document.get.update = function(query, callback) {
      var data = self.document.model.update();
      db.get(query.selector, function(err, doc) {
         if (err) data.message = err.message
         else {
            data.form.document = doc;
         }
         callback(data);
      })
   }
   
   self.document.update = function(data, callback) {
      var cbdata = {};
      db.get(data.selector, function (err, doc) {
         db.save(data.selector, doc.rev, data.content, function (err, res) {
            if (err) {
               cbdata.message = err.message 
            }
            else {
               cbdata.url = '/';
               cbdata.message = 'Document ' + data.selector + ' has updated successfully!';
               callback(cbdata);
            }
         });
      });
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