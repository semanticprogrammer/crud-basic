module.exports = function (env) {
   var 
   util = require('util'),
   self = { 
      database: {
         model: {},
         get: {}         
      },
      document: {
         model: {},
         get: {}
      }
   }
   var cradle = require('cradle');
   var client = new(cradle.Connection)(env.host, env.port);
   var db = client.database(env.db);
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
      var ret = {};
      ret.dbName = db.name;
      ret.entities = [];      
      db.exists(function (err, exists) {
         if (exists) {
            db.all(function(err, res) {
               ret.entities = res.rows.map(function (row) {
                  return {
                     id: row.id, 
                     value: JSON.stringify(row.value)
                  }
               });            
               callback(ret);
            })
         } else {
            console.log(db.name + ' database does not exists.');
            db.create();
            callback(ret);
         }
      });
   }
   self.database.model.create = function() {
      return {
         url: '/resource/database',
         form: {
            database: {
               name: ''
            }
         }
      }
   }
   self.database.get.create = function(query, callback) {
      var ret = self.database.model.create();
      callback(ret)
   }
   self.database.create = function(data, callback) {
      var ret = {};
      var db1 = client.database(data.content.name);
      db1.create();
      ret.url = '/';
      ret.message = 'Database ' + db1.name + ' has created successfully!';
      callback(ret);
   }
   self.document.get = function(data, callback) {
      db.get(data.selector, function(err, doc) {
         var ret = {};
         if (err) ret.message = err.message
         else {
            ret.url = '/resource/document/' + doc._id;
            ret.content = doc;                  
         }
         callback(ret);
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
      var ret = {};
      ret = self.document.model.create();
      callback(ret)
   }
   self.document.create = function(data, callback) {
      if (data.content.json) {
         data.content = JSON.parse(data.content.json);
      }
      db.save(data.content, function(err, res) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = '/';
            ret.message = 'Document ' + res._id + ' has created successfully!';
         }
         callback(ret)
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
      var ret = self.document.model.update();
      db.get(query.selector, function(err, doc) {
         if (err) ret.message = err.message
         else {
            ret.form.document = doc;
         }
         callback(ret);
      })
   }
   self.document.update = function(data, callback) {
      var ret = {};
      db.get(data.selector, function (err, doc) {
         db.save(data.selector, doc.rev, data.content, function (err, res) {
            if (err) {
               ret.message = err.message 
            }
            else {
               ret.url = '/';
               ret.message = 'Document ' + data.selector + ' has updated successfully!';
               callback(ret);
            }
         });
      });
   }
   self.document['delete'] = function(data, callback) {
      db.get(data.selector, function (err, res) {
         db.remove(data.selector, res.rev, function (err, res) {
            var ret = {};
            if (err) {
               ret.message = err.message;
               callback(ret);
            }
            else {
               ret.message = 'Document ' + data.selector + ' has deleted successfully!';
               callback(ret);
            }
         })
      })
   }
   return self;
}