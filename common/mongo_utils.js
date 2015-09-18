var mongodb      = require('mongodb')
    ,MongoClient = mongodb.MongoClient
    ,ObjectID    = require('bson-objectid')
    ,Join        = require('mongo-join').Join;

var DATABASE_NAME = "toctoktalk-products";
var HOST          = "loopyseo-vm.cloudapp.net:27017";

var options = {
  poolSize : 10,
  socketOptions : {
    connectTimeoutMS: 20000,
    socketTimeoutMS : 20000
  }
};

var client = null;
var collections = {};

MongoClient.connect(getDatabaseUri(HOST, DATABASE_NAME), options, function(err, db){
  if(err){
    if(db){
      db.close();
    }
  }else{
    client = db;
    client.on('close', function(){
      client = null;
      collections = {};
    });
  }
});

exports.getCollection = function(name, callback){
  if(client){
    if(!collections[name]){
      collections[name] = client.collection(name);
    }
    callback(null, collections[name]);
  }else{
    callback(new Error('not connected'));
  }
}

exports.getRefDocument = function(colls, cursor, callback){

  var join = new Join(client);
  for(var i in colls){
    var coll = colls[i];
    var obj = {
      field: coll+'_ref_id',
      to: '_id',
      from: coll
    };
    join.on(obj);
  };

  join.toArray(cursor, callback);
}


exports.getNextSeqNumber = function(collection, callback){
  var cursor = collection.find({}, {'seq_number':1, _id:0}, {sort:{seq_number:-1}, limit : 1});
  cursor.toArray(function(err, maxSeq){
    if(err){
      callback(err);
    }else{
      var nextSeq = 1;
      if(maxSeq.length > 0){
        nextSeq = Number(maxSeq[0]['seq_number'])+1;
      }

      callback(null, nextSeq);
    }
  });
};

exports.getObjectId = function(ids){
  var retVal = null;
  if(Array.isArray(ids)){
    retVal = [];
    for(var i in ids){
      var id = ids[i];
      retVal.push(ObjectID(id));
    }
  }else{
    retVal = ObjectID(ids);
  }

  return retVal;
}


function getDatabaseUri(host, databaseName){
  return 'mongodb://'+host+'/'+databaseName+'?w=0';
}
