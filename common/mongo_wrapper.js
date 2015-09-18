var Mongo = require('./mongo_utils');

module.exports = {
  findDocs : function(collection, find, opt, join_colls, callback){
    var cursor = collection.find(find, {sort:sort, skip:skip, limit:limit});
    if(join_colls){
      Mongo.getRefDocument(join_colls, cursor, function(err1, docs){
        if(err1){
          callback(err1);
        }else{
          callback(null, docs);
        }
      });
    }else{
        cursor.toArray(function(err2, docs){
          if(err2){
            callback(err2);
          }else{
            callback(null, docs);
          }
        });
    }
  }

  ,createDoc : function(collection, create_doc, callback){
    Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
      if(err1){
        callback(err1);
      }else{
        create_doc['seq_number'] = nextSeq;
        collection.insert(create_doc,{w:1}, function(err2, created){
          if(err2){
            callback(err2);
          }else{
            create_doc['_id'] = created['electionId'];
            callback(null, create_doc);
          }
        });

      }
    });
  }

  ,findOrCreate : function(collection, find, create_doc, callback){
    Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
      if(err1){
        callback(err1);
      }else{
        create_doc['seq_number'] = nextSeq;
        collection.findAndModify(
          find,
          {_id:1},
          {
            $setOnInsert : create_doc
          },
          {
            new : true,
            upsert:true
          },
          function(err2, doc){
            if(err2){
              callback(err2);
            }else{
              callback(null, doc);
            }
          });
      }
    });
  }

  ,findAndModify : function(collection, find, update, callback){    
    Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
      if(err1){
        callback(err1);
      }else{
        collection.findAndModify(
          find
          ,{_id:1}
          ,update
          ,{
            new : true,
            upsert:true
          }
          ,function(err2, doc){
            if(err2){
              callback(err2);
            }else{
              callback(null, doc);
            }
          });
      }
    });
  }
};
