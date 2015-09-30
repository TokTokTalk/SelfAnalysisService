
var express = require('express');
var router = express.Router();



var Mongo = _Common.MongoUtils;
var MongoWrapper = _Common.MongoWrapper;
var Utils = _Common.Utils;

/**
 * @apiVersion 0.0.1
 * @api {post} /document/find Query Documents
 * @apiPermission None
 * @apiName QueryDocuments
 * @apiGroup Document
 * @apiSampleRequest off
 *
 * @apiParam {String} database database 명
 * @apiParam {String} collection 컬렉션명
 * @apiParam {Object} query 쿼리조건
 * @apiParam {Object} [sort] 정렬옵션
 * @apiParam {Number} [page_number] skip개수
 * @apiParam {Number} [page_size] 요청할 개수
 * @apiParam {String[]} [join_colls] join할 컬렉션명들
 *
 * @apiSuccess {Number} code 결과 코드
 * @apiSuccess {Object} result 요청한 Documents
 *
 */
 router.get('/find', function(req, res, next){
   var params          = JSON.parse(req.query.params);
   var database_name   = params.database;
   var collection_name = params.collection;
   var find      = params.find;
   var sort       = params.sort;
   var skip       = params.page_number;
   var limit      = params.page_size;
   var join_colls = params.join_colls;

   if(!sort) sort   = {'_id':1};
   if(!skip) skip   = 0;
   if(!limit) limit = 0;

   skip = limit*skip;

   console.log(params);

   if(find['_id']){
     if(find['_id']['$in']){
       find['_id']['$in'] = Mongo.getObjectId(find['_id']['$in']);
     }else{
       find['_id'] = Mongo.getObjectId(find['_id']);
     }
   }

   Mongo.getCollection(collection_name, function(err0, collection){
     if(err0){
       next(err0);
     }else{
       var cursor = collection.find(find, {sort:sort, skip:skip, limit:limit});
       if(join_colls){
         Mongo.getRefDocument(join_colls, cursor, function(err1, docs){
           if(err1){
             next(err1);
           }else{
             res.status(200).send({result:docs, code:200});
           }
         });
       }else{
           cursor.toArray(function(err2, docs){
             if(err2){
               next(err2);
             }else{
               res.status(200).send({result:docs, code:200});
             }
           });
       }
     }
   });
 });



/**
 * @apiVersion 0.0.1
 * @api {post} /document/create create Document
 * @apiPermission None
 * @apiName CreateDocument
 * @apiGroup Document
 * @apiSampleRequest off
 *
 * @apiParam {String} database database 명
 * @apiParam {String} collection 컬렉션명
 * @apiParam {Object} create_doc 생성할 다큐먼트
 *
 * @apiSuccess {Number} code 결과 코드
 * @apiSuccess {Object} result 생성된 Document
 *
 */

 router.post('/create',function(req, res, next){
   var database_name   = req.body.database;
   var collection_name = req.body.collection;
   var create_doc      = req.body.entity;

   console.log(req.body);

   Mongo.getCollection(collection_name, function(err0, collection){
     if(err0){
       next(err0);
     }else{
       Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
         if(err1){
           next(err1);
         }else{
           create_doc['seq_number'] = nextSeq;

           collection.insert(create_doc,{w:1}, function(err2, created){
             if(err2){
               next(err2);
             }else{
               create_doc['_id'] = created['electionId'];
               res.status(200).send({result : create_doc});
             }
           });

         }
       });
     }
   });
 });

router.post('/findOrCreate',function(req, res, next){
  var database_name   = req.body.database;
  var collection_name = req.body.collection;
  var create_doc      = req.body.entity;
  var find           = req.body.find;

  console.log(req.body);

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
        if(err1){
          next(err1);
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
              console.log(doc);
              if(err2){
                next(err2);
              }else{
                res.status(200).send({result:doc.value});
              }
            });
        }
      });
    }
  });
});


/*
router.post('/insertKeyword',function(req, res, next){
  var collection_name = 'keyword';
  var create_doc      = req.body.create_doc;
  var find            = req.body.find;

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      MongoWrapper.findOrCreate(collection, find, create_doc, function(err1, doc1){
        if(err1){
          next(err1);
        }else{
          var isExisting = doc1.lastErrorObject.updatedExisting;
          if(isExisting){
              res.status(200).json({result:{doc : doc1.value, isExisting : isExisting}});
          }else{
            req.trigger_args = doc1.value;
            next();
          }
        }
      });
    }
  });
}, insertKeywordToCategory);

function insertKeywordToCategory(req, res, next){
  var doc = req.trigger_args;

  Mongo.getCollection('category', function(err0, collection){
    if(err0){
      next(err0);
    }else{
      var find = {
        _id : Mongo.getObjectId(doc['cate_ref'])
      };
      var update = {
        $set : {}
      };

      var insertKey = 'keyword_refs.'+doc['_id'];

      update['$set'][insertKey] = doc;

      MongoWrapper.findAndModify(collection, find, update, function(err2, add){
        if(err2){
          next(err2);
        }else{
          res.status(200).send({result : doc});
        }
      });
    }
  });
}
*/


router.post('/recordKeyword',function(req, res, next){
  var collection_name = 'record';
  var create_doc      = req.body.create_doc;
  var find            = req.body.find;

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      MongoWrapper.findDoc(collection, find, function(err1, doc1){
        if(err1){
          next(err1);
        }else{
          if(!doc1){
            MongoWrapper.createDoc(collection, create_doc, function(err2, created){
              if(err2){
                next(err2);
              }else{
                console.log('created');
                console.log(created);
                res.status(200).send({result : created});
              }
            });
          }else{
            MongoWrapper.findAndModify(collection, find, {$inc:{count:1}}, function(err3, finded){
              if(err3){
                next(err3);
              }else{
                console.log('increase');
                console.log(finded)
                res.status(200).send({result : finded.value});
              }
            });
          }
        }
      });
    }
  });
});

router.get('/recordAvg', function(req, res, next){
  var params          = JSON.parse(req.query.params);
  var collection_name = 'record';
  var key_ids         = params.key_ids;

  var find = {keyword_ref:{$in:key_ids}};

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      var cursor = collection.find(find, {sort:{keyword_ref:1}});
      cursor.toArray(function(err2, docs){
        if(err2){
          next(err2);
        }else{
          //res.status(200).send({result:docs, code:200});
          var merge = {};
          var sum = 0;
          for(var i in docs){
            var doc = docs[i];
            if(!merge[doc.keyword_ref]){
              merge[doc.keyword_ref] = 0;
            }
            sum = sum + doc.count;
            merge[doc.keyword_ref] = merge[doc.keyword_ref] + doc.count;
          }

           res.status(200).send({result:{sum : sum, data : merge}});
        }
      });
    }
  });
});


router.get('/findRecord',function(req, res, next){
  var params     = JSON.parse(req.query.params);
  var key_ids    = params.key_ids;
  var collection_name = "record";

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      var find = {keyword_ref:{$in:key_ids}};

      console.log(find);

      MongoWrapper.findDocs(collection, find, {sort:{record_dt:1}}, null, function(err1, docs){
        if(err1){
          next(err1);
        }else{

          var maxLenth = 0;
          var result = {};
          for(var i in docs){
            var doc = docs[i];
            var key = doc['keyword_ref'];
            if(!result[key]){
              result[key] = [];
            }
            result[key].push(doc);

            if(result[key].length > maxLenth){
              maxLenth = result[key].length;
            }
          }

          res.status(200).send({result:{data:result, max_len : maxLenth}});
        }
      });
    }
  });
});


module.exports = router;
