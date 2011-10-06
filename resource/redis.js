module.exports = function (env) {
   var redis = require('redis'),
   self = {};

   var client = redis.createClient(env.port || env.socket, env.host);
   if (env.pass) {
      client.auth(env.pass, function(err){
         if (err) throw err;
      });
   }   
   return self;
}