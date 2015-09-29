var express = require('express')
    ,router = express.Router()
    ,fs     = require('fs')
    ,path   = require('path');


router.post('/chkResources', function(req, res, next) {
  var saved_file_list = req.body.file_list;

  fs.readdir('./public/images', function(err, files) {
  	if (err){
      console.log(err);
      next(err);
    }else{
      var result = [];
      files.forEach(function(f) {
        if(saved_file_list.indexOf(f) != -1) return true;
        result.push(f);
      });

      res.status(200).send({result:result});
    }
  });
});


module.exports = router;
