var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');

var Mongo = _Common.MongoUtils;
var Utils    = _Common.Utils;


var Template = _Common.Template;

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

                var isExisting = doc.lastErrorObject.updatedExisting;
                if(isExisting){
                  res.status(200).send({result:{user : req.session.user_profile, icon_list : []}});
                }else{
                    next();
                }
              }
            });
        }
      });
    }
  });

}, createCategoryTemp, createKeyword);

function createCategoryTemp(req, res, next){
  var userRefId = req.session.user_profile['_id'];
  var collection_name = 'category';

  var dt = new Date();


  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
        if(err1){
          next(err1);
        }else{
          var insertCategory = [];
          var idx = 0;
          for(var key in Template){
            var obj = {
              cate_name : key,
              seq_number : Number(nextSeq+idx),
              timestamp : new Date().getTime(),
              start_dt  : dateformat(new Date(), 'yyyymmdd'),
              user_ref : userRefId.toString()
            }
            insertCategory.push(obj);
            idx++;
          }
          collection.insert(insertCategory, {w:1}, function(err2, created){
            if(err2){
              next(err2);
            }else{
              var createdCategory = created.ops;
              req.category = createdCategory
              next();
              //res.status(200).send({result:"OK"});
            }
          });
        }
      });

    }
  });
}

function createKeyword(req, res, next){
  var categoryList = req.category;
  var collection_name = 'keyword';
  console.log(collection_name);

  Mongo.getCollection(collection_name, function(err0, collection){
    if(err0){
      next(err0);
    }else{
      Mongo.getNextSeqNumber(collection, function(err1, nextSeq){
        if(err1){
          next(err1);
        }else{
          var insertKeyword = [];
          var retFileList   = [];
          var idx = 0;


          for(var i in categoryList){
              var category = categoryList[i];
              var cate_name = category['cate_name'];
              var keywordList = Template[cate_name];
              for(var k in keywordList){
                var keyword = keywordList[k];
                var keyObj = {
                  keyword : keyword['keyword'],
                  timestamp : new Date().getTime(),
                  cate_ref : category['_id'].toString(),
                  seq_number : Number(nextSeq + idx)
                };
                retFileList.push(keyword['icon_file_name']);
                insertKeyword.push(keyObj);
                idx++;
              }
          }

          collection.insert(insertKeyword, {w:1}, function(err2, created){
            if(err2){
              next(err2);
            }else{
              var retFileList = {};
              var createdKeywords = created.ops;
              for(var i in createdKeywords){
                var item = createdKeywords[i];
                var key = item['_id'];
                var value = getKeywordTempObj()[item.keyword];
                item['icon_file_name'] = value;
                retFileList[key] = item;
              }

              console.log(retFileList);

              res.status(200).send({result:{user : req.session.user_profile, icon_list : retFileList}});
            }
          });
        }
      });
    }
  });

}

function getKeywordTempObj(){
  var keywordObjs = {};
  for(var key in Template){
    var temp = Template[key];
    for(var i in temp){
      var keywords = temp[i];
      keywordObjs[keywords['keyword']] = keywords['icon_file_name'];
    }
  }

  return keywordObjs;
}


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




module.exports = router;
