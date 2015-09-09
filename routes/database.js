
var express = require('express');
var router = express.Router();

var DBClient = _Common.DBClient;
var Utils    = _Common.Utils;

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
  var query      = params.query;
  var sort       = params.sort;
  var skip       = params.page_number;
  var limit      = params.page_size;
  var join_colls = params.join_colls;

  if(!query) query = {};
  if(!sort) sort   = {'_id':1};
  if(!skip) skip   = 0;
  if(!limit) limit = 0;

  skip = limit*skip;

  if(query['_id']){
    if(query['_id']['$in']){
      query['_id']['$in'] = Utils.getObjectId(query['_id']['$in']);
    }else{
      query['_id'] = Utils.getObjectId(query['_id']);
    }
  }

  DBClient.getDatabase(database_name, function(err0, db){
    if(err0){
      next(err0);
    }else{
      var collection = db.collection( collection_name );
      var cursor = collection.find(query, {sort:sort, skip:skip, limit:limit});

      if(join_colls){
        DBClient.getRefDocument(db, join_colls, cursor, function(err2, docs){
          if(err2){
            next(err2);
          }else{
            res.status(200).send({result:docs, code:200});
          }
        });
      }else{
          cursor.toArray(function(err1, docs){
            if(err1){
              next(err1);
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

  DBClient.getDatabase(database_name, function(err0, db){
    if(err0){
      next(err0);
    }else{

      var collection = db.collection( collection_name );
      getMaxVal(collection, {}, 'seq_number', function(err1, maxVal){
        if(err1){
          next(err1);
        }else{

          var nextSeq = Number(maxVal) + 1;
          create_doc['seq_number'] = nextSeq;

          collection.insert(create_doc,{w:1}, function(err2, created){
            if(err2){
              next(err2);
            }else{
              res.status(200).send(created.ops);
            }
          });

        }
      });
    }
  });

});

function getMaxVal(client, query, field, callback){

  var filter = {};
  filter[field] = true;

  var sort = {};
  sort[field] = -1;

  client.find(query, filter, {sort:sort, limit:1}).toArray(function(err, maxVal){
    if(err) callback(err);
    else{
      if(maxVal.length == 0){
        callback(null, 0);
      }else{
        callback(null, maxVal[0][field]);
      }
    }
  });
}

module.exports = router;
