
/*
{
	_id: String,
	url: String,
	name: String,
	comment: String,
	created_at: Date
}
*/

var followCounter = 1;

FollowProvider = function() {};

FollowProvider.prototype.dummyData = [];

FollowProvider.prototype.findAll = function(callback) {
	callback(null, this.dummyData);
};

FollowProvider.prototype.save = function(follows, callback) {

	var follow = null;

	if(follows.length === undefined) {
		follows = [follows];
	}

	for(var i=0; i<follows.length; i++) {
		follow = follows[i];
		follow._id = followCounter++;
		follow.created_at = new Date();

		this.dummyData[this.dummyData.length] = follow;
	}

	callback(null, follows);
};

new FollowProvider().save([
	{url: 'http://google.com.hk', name: 'Google', comment: 'favourit site'},
	{url: 'http://google.com.hk', name: 'Google', comment: 'favourit site'},
	{url: 'http://google.com.hk', name: 'Google', comment: 'favourit site'}
], function(err, articles) {

});

exports.FollowProvider = FollowProvider;
