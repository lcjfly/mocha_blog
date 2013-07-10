var articleCounter = 1;
var articles_per_page = 3;


ArticleProvider = function() {};
ArticleProvider.prototype.dummyData = [];

ArticleProvider.prototype.findAll = function(callback) {
	callback(null, this.dummyData);
};

ArticleProvider.prototype.findById = function(id, callback) {
	var result = null;
	for(var i=0; i < this.dummyData.length; i++) {
		if(this.dummyData[i]._id == id) {
			result = this.dummyData[i];
			break;
		}
	}

	callback(null, result);
};

ArticleProvider.prototype.findByPage = function(page_no, callback) {
	// 请求页不存在，返回'/'
	if(page_no < 1 || (page_no - 1)*articles_per_page > this.dummyData.length) {
		this.findByPage(1, callback);
	} else {
		// 返回文章列表
		var result = {
			articles: this.dummyData.slice((page_no - 1)*articles_per_page, (page_no - 1)*articles_per_page + articles_per_page),
			page_on: page_no,
			page_max: (this.dummyData.length%articles_per_page)==0?this.dummyData.length/articles_per_page:parseInt(this.dummyData.length/articles_per_page)+1,
			page_previous: -1,
			page_next: -1
		}

		// 上一页页码
		if(page_no > 1) {
			result.page_previous = parseInt(page_no) - 1;
		}

		// 下一页页码
		if(page_no*articles_per_page < this.dummyData.length) {
			result.page_next = parseInt(page_no) + 1;
		}

		callback(null, result)
	}
};

ArticleProvider.prototype.findArchives = function(callback) {
	var result = [];
	for(var i=0; i<this.dummyData.length; i++) {
		result[i] = {};
		result[i]._id = this.dummyData[i]._id;
		result[i].created_at = this.dummyData[i].created_at.Format("yyyy-MM-dd");
		result[i].title = this.dummyData[i].title;
	}

	callback(null, result);
}

ArticleProvider.prototype.save = function(articles, callback) {
	var article = null;

	if(articles.length === undefined) {
		articles = [articles];
	}

	for(var i=0; i<articles.length; i++) {
		article = articles[i];
		article._id = articleCounter++ ;
		article.created_at = new Date();

		if(article.comments === undefined) {
			article.comments = [];
		}

		for(var j=0; j<article.comments.length; j++) {
			article.comments[j].created_at = new Date();
		}
		this.dummyData[this.dummyData.length] = article;
	}

	callback(null, articles);
}

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
	{title: 'After applying operations', body: 'After applying operations, we want to wait a moment and then poll again for new data with our $gteoperation. We want this operation to be fast, quickly skipping past old data we have already processed. However, we do not want to build an index on ts, as indexing can be somewhat expensive, and the oplog is write-heavy. Instead, we use a table scan in natural order, but use a tailable cursor to "remember" our position. Thus, we only scan once, and then when we poll again, we know where to begin.', comments: [{author: 'mike', comment: 'hey'}, {author: 'tom', comment: 'sss'}]},
	{title: 'An OpTime', body: 'An OpTime is a 64-bit timestamp that we use to timestamp operations. These are stored as Javascript Date datatypes but are not JavaScript Date objects. Implementation details can be found in the OpTime class in repl.h.'},
	{title: 'See the Replication', body: 'See the Replication section of the Mongo Developers'},
	{title: 'However', body: 'However, there is some overhead for each intent declaration, so if many members of a struct will be written, it is likely better to just declare intent on the whole struct.'},
	{title: 'If you have', body: 'If you have and error event and it isnt obvious what the error is, query for that error code on Jira. If still nothing please post to support forums.'},
	{title: 'OpTime', body: 'An OpTime is a 64-bit timestamp that we use to timestamp operations. These are stored as Javascript Date datatypes but are not JavaScript Date objects. Implementation details can be found in the OpTime class in repl.h.'},
	{title: 'See the Replication', body: 'See the Replication section of the Mongo Developers'},
	{title: 'However', body: 'However, there is some overhead for each intent declaration, so if many members of a struct will be written, it is likely better to just declare intent on the whole struct.'}
], function(err, articles) {

});

exports.ArticleProvider = ArticleProvider;



