var MongoClient = require('mongodb').MongoClient;
var Join        = require('mongo-join').Join;

var DB = {};
var URL = {
  'toktoctalk-products':'mongodb://' + _Config.MONGO.HOST + '/toktoctalk-products'
};

module.exports = {
  getDatabase : function(databaseName, callback){
    if(DB[databaseName]){
      console.log('exists database!');
      callback(null, DB[databaseName]);
    }else{
      console.log(URL[databaseName]);
      MongoClient.connect(URL[databaseName], function(err, db){
        if(err){
          callback(err);
        }else{
          DB[databaseName] = db;
          callback(null, DB[databaseName]);
          console.log('database created!');
        }
      });
    }
  },

  getRefDocument : function(db, colls, cursor, callback){

    var join = new Join(db);

    for(var i in colls){
      var coll = colls[i];
      var obj = {
        field: coll+'_ref_id',
        to: '_id',
        from: coll
      };
      console.log(obj);
      join.on(obj);
    };

    join.toArray(cursor, callback);
  }

};
