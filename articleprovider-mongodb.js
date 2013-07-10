
var Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server,
	BSON = require('mongodb').BSON,
	ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
	this.db = new Db('node-mongo-blog', new Server(host, port, {autoReconnect: true}, {}));
	this.db.open(function() {});
};

ArticleProvider.prototype.getCollection = function(callback) {
	this.db.collection('articles', function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			callback(null, article_collection);
		}
	});
};

ArticleProvider.prototype.findAll = function(callback) {
	this.getCollection(function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			article_collection.find().toArray(function(err, results) {
				if(err) {
					callback(err);
				} else{
					callback(null, results);
				}
			});
		}
	});
};

ArticleProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			var id_hex = article_collection.db.bson_serializer.ObjectID.createFromHexString(id);
			article_collection.findOne({_id: id_hex}, function(err, article) {
				if(err) {
					callback(err);
				} else {
					callback(null, article);
				}
			});
		}
	});
};

ArticleProvider.prototype.save = function(articles, callback) {
	this.getCollection(function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			if(articles.length === undefined) {
				articles = [articles];
			}

			for(var i=0; i<articles.length; i++) {
				article = articles[i];
				article.created_at = new Date();
				if(article.comments === undefined) {
					article.comments = [];
				}
				for(var j=0; j<article.comments.length; j++) {
					article.comments[j].created_at = new Date();
				}

			}

			article_collection.insert(articles, function() {
				callback(null, articles);
			});
		}
	});
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
	this.getCollection(function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			article_collection.update(
				{
					_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)
				},
		        {
		        	"$push": {comments: comment}
		        },
		        function(error, article){
		          if( error ) {
		          	callback(error);
		          } else {
		          	callback(null, article);
		          }
		        }
        	);
		}
	});
};

exports.ArticleProvider = ArticleProvider;

/*
{
  _id: 0,
  title: '',
  body: '',
  comments: [{
    person: '',
    comment: '',
    created_at: new Date()
  }],
  created_at: new Date()
}
*/

new ArticleProvider().save([
	{title: 'Post one', body: 'Body one', comments: [{author: 'mike', comment: 'hey'}, {author: 'tom', comment: 'sss'}]},
	{title: 'Post two', body: 'Body two'},
	{title: 'Post three', body: 'Body three'},
	{title: 'Post four', body: 'Body four'},
	{title: 'Post five', body: 'Body five'}
], function(err, articles) {

});



