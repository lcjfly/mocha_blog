
/*
{
	_id: String,
	url: String,
	name: String,
	comment: String,
	created_at: Date
}
*/

var Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server,
	BSON = require('mongodb').BSON,
	ObjectID = require('mongodb').ObjectID;

var options = {
    host: 'dharma.mongohq.com',
      port: 10053,
      db: 'mocha_blog',
      username: 'lcjfly',
      password: 'fuxu2011!'
  };

FollowProvider = function() {
	
	this.db = new Db(
        options.db, 
        new Server(
            options.host, 
    	    options.port, 
    	    {auto_reconnect: true}, 
    	    {}
        )
    );
	
	this.db.open(function(err,data){
	  if(data){
	    data.authenticate(options.username, options.password, function(err2,data2){
	         if(data2){
	             console.log("Database opened");
	         }
	         else{
	             console.log(err2);
	         }
	    });
	  } else {
	       console.log(err);
	  }
	});
};

FollowProvider.prototype.getCollection = function(callback) {
	this.db.collection('follows', function(err, follow_collection) {
		if(err) {
			callback(err);
		} else {
			callback(null, follow_collection);
		}
	});
};

FollowProvider.prototype.findAll = function(callback) {
	this.getCollection(function(err, follow_collection) {
		if(err) {
			callback(err);
		} else {
			follow_collection.find().toArray(function(err, results) {
				if(err) {
					callback(err);
				} else{
					callback(null, results);
				}
			});
		}
	});
};

FollowProvider.prototype.save = function(follows, callback) {
	this.getCollection(function(err, follow_collection) {
		if(err) {
			callback(err);
		} else {
			if(follows.length === undefined) {
				follows = [follows];
			}
			
			follow_collection.insert(follows, function(err) {
				if(err) {
					callback(err);
				} else {
					callback(null, follow_collection);
				}
			});
		}
	});
}

FollowProvider.prototype.delete = function(follow_id, callback) {
	this.getCollection(function(err, follow_collection) {
		if(err) {
			callback(err);
		} else {
			follow_id = follow_collection.db.bson_serializer.ObjectID.createFromHexString(follow_id);
			follow_collection.remove({_id: follow_id}, function(err) {
				if(err) {
					callback(err);
				} else {
					callback(null);
				}
			});
		}
	});
}

exports.FollowProvider = FollowProvider;

