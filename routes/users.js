var express = require('express');
var router = express.Router();


var Mongo = _Common.MongoUtils;
var Utils    = _Common.Utils;

/**
 * @apiVersion 0.0.1
 * @api {post} /document/joinOrLogin joinOrLogin
 * @apiPermission None
 * @apiName joinOrLogin
 * @apiGroup User
 * @apiSampleRequest off
 *
 * @apiParam {String} database database 명
 * @apiParam {String} collection 컬렉션명
 * @apiParam {Object} entity 유저정보
 *
 * @apiSuccess {Number} code 결과 코드
 * @apiSuccess {Object} result 가입 or 로그온 유저정보
 *
 */
router.post('/joinOrLogin', function(req, res, next) {
  var database_name   = req.body.database;
  var collection_name = req.body.collection;
  var user_profile    = req.body.entity;

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
        if(err1){
          next(err1);
        }else{
          user_profile['seq_number'] = nextSeq;          
          collection.findAndModify(
            {fb_id : user_profile.fb_id},
            {_id:1},
            {
              $setOnInsert : user_profile
            },
            {
              new : true,
              upsert:true
            },
            function(err2, doc){
              if(err2){
                next(err2);
              }else{
                req.session.user_profile = doc.value;
                res.status(200).send({result:doc.value});
              }
            });
        }
      });
    }
  });

});


router.get('/login', function(req, res, next) {
  var params          = JSON.parse(req.query.params);
  var database_name   = 'toctoktalk-products';
  var collection_name = 'user';
  var fb_id = params.fb_id;

  DBClient.getDatabase(database_name, function(err0, db){
    if(err0){
      next(err0);
    }else{

      var collection = Mongo.collection( collection_name );
      collection.findOne({fb_id : fb_id}, function(err1, user){
        if(err1){
          next(err1);
        }else{
          req.session.user_profile = user;
          res.status(200).send({result:user});
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
