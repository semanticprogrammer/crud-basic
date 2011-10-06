module.exports = function (env) {
   var mysql = require('mysql'),
   util = require('util');
   self = { 
      database: {},
      table: {
         model: {}, 
         get: {}
      },
      item: {
         model: {}, 
         get: {}
      }
   }
   var client = mysql.createClient({
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      database: env.db
   });
   self.open = function(callback) {
      return callback();
   }
   self.database.name = function() {
      return client.database;
   }
   self.database.info = function(callback) {
      var ret = {}, prop;
      ret.dbName = client.database;
      ret.entityNames = [];
      client.query("SHOW TABLES", function(err, names) {
         names.forEach(function(element) {
            if (!prop) prop = Object.keys(element)[0];
            ret.entityNames.push(element[prop]);
         });
         callback(ret)
      });      
   }
   self.table.model.create = function() {
      return {
         url: '/resource/table',
         form: {
            table : {
               json: {}
            }
         }
      }
   }
   self.table.get.create = function(query, callback) {
      var ret = self.table.model.create();
      callback(ret)
   }
   self.table.model.update = function() {
      return {
         url: '/resource/table',
         form: {
            table : {
               from: '',
               to: ''
            }
         }
      }
   }
   self.table.get.update = function(query, callback) {
      var ret = self.table.model.update();
      ret.form.table.from = query.selector;
      callback(ret)
   }
   //{"name": "table1", "definition": {"id": "int unsigned"}, "constraint":["PRIMARY KEY(id)"]}
   self.table.create = function(data, callback) {
      var sql = 'CREATE TABLE ';
      if (data.content.json) {
         data.content = JSON.parse(data.content.json);
      }
      sql += data.content.name + ' (';
      for (var prop in data.content.definition) {
         sql += prop + ' ' + data.content.definition[prop] + ', ';
      }
      data.content.constraint.forEach(function(element) {
         sql += element + ', ';
      });
      sql = sql.replace(/, $/g, "");
      sql += ');';
      client.query(sql, function(err) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = '/';
            ret.message = 'Table ' + data.content.name + ' has created successfully!';
         }
         callback(ret)
      })
   }
   self.table.update = function(data, callback) {
      client.query('RENAME TABLE ' + data.content.from + ' TO ' + data.content.to, function(err) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.message = 'Table ' + data.content.from + ' has renamed successfully!';
         }       
         callback(ret)
      })
   }
   self.table['delete'] = function(data, callback) {
      client.query('DROP TABLE ' + data.selector, function(err) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.message = 'Table ' + data.selector + ' has deleted successfully!';
         }
         callback(ret)
      })
   }
   self.list = function(name, callback) {
      client.query("SELECT * FROM " + name, function(err, results, fields) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = results;
            ret.name = name;
         }
         callback(ret);
      });
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
      var ret = {};
      ret = self.item.model.create();
      ret.context = query.context;
      callback(ret)
   }
   self.item.create = function(data, callback) {
      var sql = 'INSERT INTO ' + data.context + '(';
      if (data.content.json) {
         data.content = JSON.parse(data.content.json);
      }
      for (var prop in data.content) {
         sql += prop + ', ';
      }
      sql = sql.replace(/, $/g, ') VALUES(');
      for (var prop in data.content) {
         sql += data.content[prop] + ', ';
      }
      sql = sql.replace(/, $/g, ');');
      client.query(sql, function(err, info) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/list/' + data.context;
            ret.message = 'Record ' + data.context + ' has created successfully!';
         }
         callback(ret)
      });
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
      var selector = '';
      query.selector = JSON.parse(query.selector);
      for (var prop in query.selector) {
         selector += prop + ' = ' + query.selector[prop] + ' AND ';
      }
      selector = selector.replace(/ AND $/g, ';');
      var ret = self.item.model.update();
      ret.context = query.context;
      client.query("SELECT * FROM " + query.context + ' WHERE ' + selector, 
         function(err, results, fields) {
            if (err) {
               ret.message = err.message;
            }
            else {
               ret.form.item = results[0];
            }         
            callback(ret);
         }
      );
   }
   self.item.update = function(data, callback) {
      var selector = '';
      for (var prop in data.selector) {
         selector += prop + ' = ' + data.selector[prop] + ' AND ';
      }
      selector = selector.replace(/ AND $/g, ';');
      var sql = 'UPDATE ' + data.context + ' SET ';
      for (var prop in data.content) {
         sql += prop + ' = ' + data.content[prop] + ', ';
      }
      sql = sql.replace(/, $/g, ' ');
      sql += 'WHERE ' + selector;
      client.query(sql, function(err, info) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/list/' + data.context;
            ret.message = 'Record ' + data.context + ' ' + selector + ' has updated successfully!';
         }
         callback(ret)
      });
   }
   self.item['delete'] = function(data, callback) {
      var selector = '';
      for (var prop in data.selector) {
         selector += prop + ' = ' + data.selector[prop] + ' AND ';
      }
      selector = selector.replace(/ AND $/g, ';');
      var sql = 'DELETE FROM ' + data.context + ' WHERE ' + selector;
      client.query(sql, function(err, info) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.message = 'Record ' + data.context + ' ' + selector + ' has deleted successfully!';
         }
         ret.url = 'view/list/' + data.context;         
         callback(ret)
      });
   }
   return self;
}