module.exports = function (env) {
   var redis = require('redis'), util = require('util'),
   self = {
      database: {},   
      key: {
         model: {}, 
         get: {}
      },
      string: {
         model: {},         
         get: {}
      },
      list: {
         model: {}, 
         get: {}
      },
      set: {
         model: {}, 
         get: {}
      },      
      zset: {
         model: {}, 
         get: {}
      },
      hash: {
         model: {}, 
         get: {}
      }
   };

   var client = redis.createClient(env.port || env.socket, env.host);
   if (env.pass) {
      client.auth(env.pass, function(err){
         if (err) throw err;
      });
   }
   if (env.db) {
      client.select(env.db);
   }
   var multi = client.multi();
   self.open = function(callback) {
      return callback();
   }   
   self.quit = function() {
      client.quit();
   }
   self.database.drop = function() {
      return client.flushdb()
   }
   self.database.info = function(callback) {
      var ret = {};
      ret.strings = [];
      ret.lists = [];
      ret.sets = [];
      ret.zsets = [];
      ret.hashs = [];
      client.keys('*', function(err, keys) {
         keys.forEach(function (key, pos) {    
            client.type(key, function (err, type) {
               var item = {
                  key: key, 
                  type: type
               };
               ret[type + 's'].push(item);
               if (pos === keys.length - 1) {
                  callback(ret)
               }
            });
         });
      });      
   }
   self.key.update = function(data, callback) {
      client.rename(data.content.from, data.content.to, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.message = data.content.from + " renamed to " + data.content.to + ' successfully!';
         }
         callback(ret)
      })
   }
   self.key.model.update = function() {
      return {
         url: '/resource/key',
         form: {
            key : {
               from: '',
               to: ''
            }
         }
      }
   }
   self.key.get.update = function(query, callback) {
      var ret = self.key.model.update();
      ret.form.key.from = query.selector;
      callback(ret)
   }
   self.key['delete'] = function(data, callback) {
      client.del(data.selector, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.message = data.selector + ' has deleted successfully!';
         }
         callback(ret)
      })
   }
   self.string.model.create = function() {
      return {
         url: '/resource/string',
         form: {
            string : {
               key: '',
               value: ''
            }
         }
      }
   }   
   self.string.get.create = function(query, callback) {
      var ret = self.string.model.create();
      callback(ret)
   }
   self.string.model.update = function() {
      return {
         url: '/resource/string',
         form: {
            string : {}
         }
      }
   }
   self.string.get.update = function(query, callback) {
      query.selector = JSON.parse(query.selector);    
      var ret = self.str.model.update();
      ret.context = query.context;
      client.get(query.selector, function(err, value) {
         if (err) {
            ret.message = err.message;
            callback(ret);
         }               
         ret.form.string = value;
         callback(ret);
      });
   }
   self.string.value = function(key, callback) {
      client.get(key, function(err, value) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = value;
            ret.key = key;
         }
         callback(ret);
      });
   }
   self.string.create = function(data, callback) {
      client.set(data.content.key, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = '/';
            ret.message = 'String ' + data.content.key + ' has created successfully!';
         }
         callback(ret)
      });
   }   
   self.list.create = function(data, callback) {
      if (Array.isArray(data.content)){
         data.content.forEach(function(element){
            multi.lpush(data.context, element)
         })
      } else {
         multi.lpush(data.context, data.content)
      }
      multi.exec(function(err, res){
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/list/' + data.context;
            ret.message = 'List ' + data.context + ' has created successfully!';
         }
         callback(ret)
      });
   }
   self.list.length = function(key, callback) {
      client.llen(key, function(err, len) {
         callback(len);
      });
   }
   self.list.items = function(key, callback) {
      client.lrange(key, 0, -1, function(err, items) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = items;
            ret.key = key;
         }
         callback(ret);
      });
   }
   self.set.items = function(key, callback) {
      client.smembers(key, function(err, items) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = items;
            ret.key = key;
         }
         callback(ret);
      });
   }    
   self.set.create = function(data, callback) {
      if (Array.isArray(data.content)){
         data.content.forEach(function(element){
            multi.sadd(data.context, element)
         })
      } else {
         multi.sadd(data.context, data.content)
      }
      multi.exec(function(err, res){
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/set/' + data.context;
            ret.message = 'Set ' + data.context + ' has created successfully!';
         }
         callback(ret)
      });
   }
   return self;
}