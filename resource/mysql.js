module.exports = function (env) {
   var mysql = require('mysql'),
   self = { 
      database: {},
      table: {
         model: {}, 
         get: {}
      },
      record: {
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
      var data = {}, prop;
      data.dbName = client.database;
      data.entityNames = [];
      client.query("SHOW TABLES", function(err, names) {
         names.forEach(function(element) {
            if (!prop) prop = Object.keys(element)[0];
            data.entityNames.push(element[prop]);
         });
         callback(data)
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
      var data = self.table.model.create();
      callback(data)
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
      var data = self.table.model.update();
      data.form.table.from = query.selector;
      callback(data)
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
         var cbdata = {};
         if (err) {
            cbdata.message = err.message;
         }
         else {
            cbdata.url = '/';
            cbdata.message = 'Table ' + data.content.name + ' has created successfully!';
         }
         callback(cbdata)
      })
   }
   self.table.update = function(data, callback) {
      client.query('RENAME TABLE ' + data.content.from,  + ' TO ' + data.content.to, function(err) {
         var cbdata = {};
         if (err) {
            cbdata.message = err.message;
         }
         else {
            cbdata.message = 'Table ' + data.content.from + ' has renamed successfully!';
         }            
         callback(cbdata)
      })
   }    
   self.table['delete'] = function(data, callback) {
      client.query('DROP TABLE ' + data.selector, function(err) {
         var cbdata = {};
         if (err) {
            cbdata.message = err.message;
         }
         else {
            cbdata.message = 'Table ' + data.selector + ' has deleted successfully!';
         }            
         callback(cbdata)
      })
   }
   self.record.create = function(data, callback) {
      client.query('....', callback);
   }

   return self;
}