
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
	{url: 'http://google.com.hk', name: 'Google', comment: '谁不爱谷歌？'},
	{url: 'http://coolshell.cn', name: '酷壳', comment: '一位技术大牛的博客'},
	{url: 'http://dribbble.com', name: 'Dribbble', comment: '设计类网站，有很多牛X设计'}
], function(err, articles) {

});

exports.FollowProvider = FollowProvider;
