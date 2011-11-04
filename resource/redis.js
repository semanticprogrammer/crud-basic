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
         get: {},
         element: { 
            model: {},
            get: {}
         }
      },
      set: {
         model: {}, 
         get: {},
         element: { 
            model: {},
            get: {}
         }
      },      
      zset: {
         model: {}, 
         get: {},
         element: { 
            model: {},
            get: {}
         }
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
            string: {
               key: '',
               value: ''
            }
         }
      }
   }
   self.string.get.update = function(query, callback) {
      var ret = self.string.model.update();
      ret.context = query.context;
      client.get(query.selector, function(err, value) {
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         ret.form.string.key = query.selector;
         ret.form.string.value = value;
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
   self.string.update = function(data, callback) {
      client.set(data.content.key, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = '/';
            ret.message = 'String ' + data.content.key + ' has updated successfully!';
         }
         callback(ret)
      });
   }
   self.list.length = function(key, callback) {
      client.llen(key, function(err, len) {
         callback(len);
      });
   }
   self.list.elements = function(key, callback) {
      client.lrange(key, 0, -1, function(err, elements) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = elements;
            ret.key = key;
         }
         callback(ret);
      });
   }
   self.list.model.create = function() {
      return {
         url: '/resource/list',
         form: {
            list : {
               key: '',
               value: ''
            }
         }
      }
   }   
   self.list.get.create = function(query, callback) {
      var ret = self.list.model.create();
      callback(ret)
   }
   self.list.element.model.create = function() {
      return {
         url: '/resource/list/element',
         form: {
            list: {
               key: '',
               element: {
                  value: ''
               }
            }
         }
      }
   }
   self.list.element.get.create = function(query, callback) {
      var ret = self.list.element.model.create();
      ret.context = query.context;
      ret.form.list.key = query.context;
      callback(ret);
   }   
   self.list.element.model.update = function() {
      return {
         url: '/resource/list/element',
         form: {
            list: {
               key: '',
               element: {
                  value: ''
               }
            }
         }
      }
   }
   self.list.element.get.update = function(query, callback) {
      var ret = self.list.element.model.update();
      ret.context = query.context;
      ret.form.list.key = query.context;
      ret.form.list.element.value = query.selector;
      callback(ret);
   }
   self.list.create = function(data, callback) {
      if (Array.isArray(data.content)){
         data.content.forEach(function(element){
            multi.lpush(data.content.key, element)
         })
      } else {
         multi.lpush(data.content.key, data.content.value)
      }
      multi.exec(function(err, res){
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/elements/list/' + data.content.key;
            ret.message = 'List ' + data.content.key + ' has created successfully!';
         }
         callback(ret)
      });
   }
   self.list.element.create = function(data, callback) {
      client.rpush(data.content.key, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.url = '/view/elements/list/' + data.context;
            ret.message = data.content.value + ' added successfully to ' + data.context;
            callback(ret);
         }
      })
   }   
   self.list.element.update = function(data, callback) {
      client.lset(data.context, data.selector, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.url = '/view/elements/list/' + data.context;
            ret.message = data.selector + ' has changed to ' + data.content.value + ' successfully!';
            callback(ret);
         }
      })
   }
   self.list.element['delete'] = function(data, callback) {
      client.lrem(data.context, 1, data.selector, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.message = data.selector + ' of ' + data.context + ' has deleted successfully!';
            ret.url = 'view/elements/list/' + data.context;
            callback(ret);
         }
      })
   }
   self.set.length = function(key, callback) {
      client.scard(key, function(err, len) {
         callback(len);
      });
   }  
   self.set.elements = function(key, callback) {
      client.smembers(key, function(err, elements) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = elements;
            ret.key = key;
         }
         callback(ret);
      });
   }
   self.set.model.create = function() {
      return {
         url: '/resource/set',
         form: {
            set: {
               key: '',
               value: ''
            }
         }
      }
   }   
   self.set.get.create = function(query, callback) {
      var ret = self.set.model.create();
      callback(ret)
   }
   self.set.element.model.create = function() {
      return {
         url: '/resource/set/element',
         form: {
            set: {
               key: '',
               element: {
                  value: ''
               }
            }
         }
      }
   }
   self.set.element.get.create = function(query, callback) {
      var ret = self.set.element.model.create();
      ret.context = query.context;
      ret.form.set.key = query.context;
      callback(ret);
   }
   self.set.create = function(data, callback) {
      if (Array.isArray(data.content)){
         data.content.forEach(function(element){
            multi.sadd(data.content.key, data.content.value)
         })
      } else {
         multi.sadd(data.content.key, data.content.value)
      }
      multi.exec(function(err, res){
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/elements/set/' + data.content.key;
            ret.message = 'Set ' + data.content.key + ' has created successfully!';
         }
         callback(ret)
      });
   }
   self.set.element.create = function(data, callback) {
      client.sadd(data.content.key, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.url = '/view/elements/set/' + data.context;
            ret.message = data.content.value + ' added successfully to ' + data.context;
            callback(ret);
         }
      })
   }
   self.set.element['delete'] = function(data, callback) {
      client.srem(data.context, 1, data.selector, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.message = data.selector + ' of ' + data.context + ' has deleted successfully!';
            ret.url = 'view/elements/set/' + data.context;
            callback(ret);
         }
      })
   }
   self.zset.length = function(key, callback) {
      client.zcard(key, function(err, len) {
         callback(len);
      });
   }  
   self.zset.elements = function(key, callback) {
      client.zrange(key, 0, -1, function(err, elements) {
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.data = elements;
            ret.key = key;
         }
         callback(ret);
      });
   }
   self.zset.model.create = function() {
      return {
         url: '/resource/zset',
         form: {
            set: {
               key: '',
               score: '',
               value: ''
            }
         }
      }
   }   
   self.zset.get.create = function(query, callback) {
      var ret = self.zset.model.create();
      callback(ret)
   }
   self.zset.element.model.create = function() {
      return {
         url: '/resource/zset/element',
         form: {
            zset: {
               key: '',
               element: {
                  score: '',
                  value: ''
               }
            }
         }
      }
   }
   self.zset.element.get.create = function(query, callback) {
      var ret = self.zset.element.model.create();
      ret.context = query.context;
      ret.form.zset.key = query.context;
      callback(ret);
   }
   self.zset.create = function(data, callback) {
      if (Array.isArray(data.content)){
         data.content.forEach(function(element){
            multi.zadd(data.content.key, data.content.score, data.content.value)
         })
      } else {
         multi.zadd(data.content.key, data.content.score, data.content.value)
      }
      multi.exec(function(err, res){
         var ret = {};
         if (err) {
            ret.message = err.message;
         }
         else {
            ret.url = 'view/elements/zset/' + data.content.key;
            ret.message = 'Sorted Set ' + data.content.key + ' has created successfully!';
         }
         callback(ret)
      });
   }
   self.zset.element.create = function(data, callback) {
      client.zadd(data.content.key, data.content.score, data.content.value, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.url = '/view/elements/zset/' + data.context;
            ret.message = data.content.value + ' added successfully to ' + data.context;
            callback(ret);
         }
      })
   }
   self.zset.element['delete'] = function(data, callback) {
      client.zrem(data.context, 1, data.selector, function(err, reply) {
         var ret = {};
         if (err) {
            ret.message = err.message;
            callback(ret);
         }
         else {
            ret.message = data.selector + ' of ' + data.context + ' has deleted successfully!';
            ret.url = 'view/elements/zset/' + data.context;
            callback(ret);
         }
      })
   }   
   return self;
}