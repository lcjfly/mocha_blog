var articles_per_page = 5;
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

ArticleProvider = function(host, port) {
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
					article.created_at = article.created_at.Format('yyyy-MM-dd');
					callback(null, article);
				}
			});
		}
	});
};

ArticleProvider.prototype.findByPage = function(page_no, callback) {
	this.findAll(function(err, article_collection) {
		// 请求页不存在，返回'/'
		if(page_no < 1 || (page_no - 1)*articles_per_page > article_collection.length) {
			this.findByPage(1, callback);
		} else {
			// 返回文章列表
			var result = {
				articles: article_collection.slice((page_no - 1)*articles_per_page, (page_no - 1)*articles_per_page + articles_per_page),
				page_on: page_no,
				page_max: (article_collection.length%articles_per_page)==0?article_collection.length/articles_per_page:parseInt(article_collection.length/articles_per_page)+1,
				page_previous: -1,
				page_next: -1
			}

			for(var i=0; i<result.articles.length; i++) {
				result.articles[i].created_at = result.articles[i].created_at.Format('yyyy-MM-dd');
			}

			// 上一页页码
			if(page_no > 1) {
				result.page_previous = parseInt(page_no) - 1;
			}

			// 下一页页码
			if(page_no*articles_per_page < article_collection.length) {
				result.page_next = parseInt(page_no) + 1;
			}

			callback(null, result)
		}
	});
};

ArticleProvider.prototype.findArchives = function(callback) {
	var results = {},
		result = {};

	this.findAll(function(err, articles) {
		for(var i=0; i<articles.length; i++) {
			result = articles[i];
			var created_at = articles[i].created_at;
			result.created_at = created_at.Format('yyyy-MM-dd');

			var article_year = created_at.Format('yyyy');
			if(results[article_year] === undefined) {
				results[article_year] = [];
			}
			results[article_year].push(result);
		}

		callback(null, results);
	});
}

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
					if(article.comments[j].created_at === undefined) {
						article.comments[j].created_at = new Date();
					}
				}
			}

			article_collection.insert(articles, function(err) {
				if(err) {
					callback(err);
				} else {
					callback(null, article_collection);
				}
			});
		}
	});
};

ArticleProvider.prototype.delete = function(article_id, callback) {
	this.getCollection(function(err, article_collection) {
		if(err) {
			callback(err);
		} else {
			article_id = article_collection.db.bson_serializer.ObjectID.createFromHexString(article_id);
			article_collection.remove({_id: article_id}, function(err) {
				if(err) {
					callback(err);
				} else {
					callback(null);
				}
			});
		}
	});
}

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



exports.ArticleProvider = ArticleProvider;



