var express = require('express');
var router = express.Router();


var DBClient = _Common.DBClient;
var Utils    = _Common.Utils;

/* GET users listing. */
router.post('/insertOrLogin', function(req, res) {
  var database_name   = req.body.database;
  var collection_name = req.body.collection;
  var user_profile            = req.body.user_profile;

  DBClient.getDatabase(database_name, function(err0, db){
    if(err0){
      next(err0);
    }else{

      var collection = db.collection( collection_name );
      var cursor = collection.find({}, {'seq_number':1, _id:0}, {sort:{seq_number:-1}, limit : 1});
      cursor.toArray(function(err1, next_seq){
        if(err1){
          next(err1);
        }else{

          if(next_seq.length == 0){
            user_profile['seq_number'] = 1;
          }else{
            user_profile['seq_number'] = Number(next_seq[0]['seq_number'])+1;
          }

          collection.findAndModify(
            {user_id : user_profile.fb_id},
            {
              $set : user_profile
            },
            {
              new : true,
              upsert:true
            },
            function(err2, doc){
              if(err2){
                next(err2);
              }else{
                req.session.user_profile = doc;
                res.status(200).send(doc);
              }
            });
        }
      });
    }
  });

});

module.exports = router;
