var fs = require('fs'),
path = require('path');

exports.createTemplate = function(templateName, opts, callback) {
   var templatePath = path.join(opts.dir, templateName + opts.ext);
   try {
      fs.readFile(templatePath, function (err, data) {
         if (err) {
            throw err;
         }
         console.log(require('util').inspect(data.toString(), true, null));
         opts.loadFunc(opts.compileFunc(data.toString(), templateName));
         console.log("'" + templateName + "' template created.");
         callback();
      });
   } catch (e) {
      throw 'template not found';
   }
};

exports.getCollection = function(db, collectionName, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         console.log("!!!!!!!!! db is ...." + util.inspect(db));
         console.log("!!!!!!!!! err is ...." + util.inspect(err));
         console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
         if (logger) logger.error("Problem with getting collection : '" + collectionName  + "' Error: " + err);
         callback(err, false);
      }
      else {
         callback(err, collection);
      }
   })
};

exports.getArray = function(db, collectionName, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         console.log("!!!!!!!!! db is ...." + util.inspect(db));
         console.log("!!!!!!!!! err is ...." + util.inspect(err));
         console.log("!!!!!!!!! db state is ...." + util.inspect(db.state));
         if (logger) logger.error("Problem with getting collection : '" + collectionName  + "' Error: " + err);
         callback(err, false);
      }
      else {
         collection.find().toArray(function(err, docs) {
            callback(err, docs);
         });
      }
   })
};

exports.find = function(db, collectionName, selector, callback) {
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
};

exports.add = function(db, collectionName, postData, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.insert(postData, {safe:true}, function(err, object) {
            if (err) callback(err)
            else callback(err, object);
         });
      }
   })
};

exports.update = function(db, collectionName, selector, postData, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.findAndModify(selector, [['key','asc']], {$set: postData}, {}, function(err, object) {
            if (err) callback(err)
            else callback(err, object);
         });
      }
   })
};

exports.remove = function(db, collectionName, id, callback) {
   db.collection(collectionName, function(err, collection) {
      if (err) {
         callback(err);
      }
      else {
         collection.remove({
            'key': id
         }, function(err) {
            callback(err);
         });
      }
   })
};

//collection.insert({hello: 'world'}, {safe:true},
//                    function(err, objects) {
//    if (err) console.warn(err.message);
//    if (err && err.message.indexOf('E11000 ') !== -1) {
//      // this _id was already inserted in the database
//    }
//  });

//collection.findAndModify( {query: {comment:'0'}, update : {"$inc":{"count":1}}, 'new': true}, function (doc) {
//  console.log(doc)
//})
//
//job = db.jobs.findAndModify( {sort:{priority:-1}, remove:true} );
//
//collection.findAndModify({hello: 'world'}, [['_id','asc']], {$set: {hi: 'there'}}, {},
//                    function(err, object) {
//    if (err) console.warn(err.message);
//    else console.dir(object);  // undefined if no matching object exists.
//  });
//


//  var collection = new mongodb.Collection(client, 'test_collection');
//  collection.find({}, {limit:10}).toArray(function(err, docs) {
//    console.dir(docs);
//  });

//         collection.find(function(err, cursor) {
//            cursor.toArray(function(err, docs) {
//               callback(err, docs);
//            });
//         });
