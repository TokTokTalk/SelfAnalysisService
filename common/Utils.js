var ObjectID = require('bson-objectid');

module.exports = {
  getObjectId : function(ids){
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
};
