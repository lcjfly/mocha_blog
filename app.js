
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    ArticleProvider = require('./articleprovider-mongodb').ArticleProvider,
    FollowProvider = require('./followprovider-mongodb').FollowProvider,
    //partials =require('express-partials'),
    fs = require('fs');
require('./date');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('layout', 'layout') // defaults to 'layout' 
  //app.use(partials());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'something'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// checkAuth
function checkAuth(req, res, next) {
  if(!req.session.user_id) {
    if(!req.url) {
      req.url = '/admin';
    }
    req.session.previous_url = req.url;
    res.redirect('/admin/login');
  } else {
    next();
  }
}

// Routes
var articleProvider = new ArticleProvider();
var followProvider = new FollowProvider();

/*
articleProvider.save([
    {title: 'After applying operations', body: 'After applying operations, we want to wait a moment and then poll again for new data with our $gteoperation. We want this operation to be fast, quickly skipping past old data we have already processed. However, we do not want to build an index on ts, as indexing can be somewhat expensive, and the oplog is write-heavy. Instead, we use a table scan in natural order, but use a tailable cursor to "remember" our position. Thus, we only scan once, and then when we poll again, we know where to begin.', comments: [{author: 'mike', comment: 'Thus, we only scan once, and then when we poll again, we know where to begin.'}, {author: 'tom', comment: 'query for that error code on Jira.'}]},
    {title: 'An OpTime', body: 'An OpTime is a 64-bit timestamp that we use to timestamp operations. These are stored as Javascript Date datatypes but are not JavaScript Date objects. Implementation details can be found in the OpTime class in repl.h.'},
    {title: 'See the Replication', body: 'See the Replication section of the Mongo Developers'},
    {title: 'However', body: 'However, there is some overhead for each intent declaration, so if many members of a struct will be written, it is likely better to just declare intent on the whole struct.'},
    {title: 'If you have', body: 'If you have and error event and it isnt obvious what the error is, query for that error code on Jira. If still nothing please post to support forums.'},
    {title: 'OpTime', body: 'An OpTime is a 64-bit timestamp that we use to timestamp operations. These are stored as Javascript Date datatypes but are not JavaScript Date objects. Implementation details can be found in the OpTime class in repl.h.'},
    {title: 'See the Replication', body: 'See the Replication section of the Mongo Developers'},
    {title: 'However', body: 'However, there is some overhead for each intent declaration, so if many members of a struct will be written, it is likely better to just declare intent on the whole struct.'}
  ], function(err, article_collection) {
    
});
*/

app.get('/', function(req, res) {
  articleProvider.findByPage(1, function(err, result) {
    res.render('index.ejs', {locals: {
      title: '我的博客',
      data: result
    }});
  });
});

app.get('/blog/:id', function(req, res) {
  articleProvider.findById(req.params.id, function(err, article) {
    res.render('blog_show.ejs',{
      locals: {
        title: article.title,
        article: article
      }
    });
  });
});

app.get('/blog/page/:page', function(req, res) {
  articleProvider.findByPage(req.params.page, function(err, result) {
    res.render('index.ejs', {locals: {
      title: '我的博客',
      data: result
    }});
  });
});

app.get('/about', function(req, res) {
  res.render('about.ejs', {locals: {
    title: '关于我'
  }});
});

app.get('/dream', function(req, res) {
  res.render('dream.ejs', {locals: {
    title: '我的梦想'
  }});
});

app.get('/archives', function(req, res) {
  articleProvider.findArchives(function(err, result) {
    res.render('archives.ejs', {locals: {
    title: '文章归档',
    archives: result
  }});
  });
});

app.get('/follow', function(req, res) {
  followProvider.findAll(function(err, result) {
    res.render('follow.ejs', {locals: {
    title: '我关注的',
    follows: result
  }});
  });
});

app.post('/blog/addComment', function(req, res) {

  // 后端完整性验证
  var author = req.body.author,
      comment = req.body.comment;

  if(author.trim() === '' || comment.trim() === '') {
    res.send('评论内容不完整，名字和内容是必填项');
  } else {
    articleProvider.addCommentToArticle(req.body._id, {
      author: req.body.author,
      comment: req.body.comment,
      email: req.body.email,
      website: req.body.website,
      created_at: new Date()
    }, function(err, docs) {
      res.redirect('/blog/' + req.body._id);
    });
  }
});

// view need authentication
app.get('/admin', checkAuth, function(req, res) {
  res.render('admin/index.ejs', {
    title: '管理后台',
    layout: 'layout_admin.ejs'
  });
});

app.get('/admin/upload', checkAuth, function(req, res) {
  fs.readdir(__dirname + '/public/images/', function(err, files) {
    files.shift();
    res.render('admin/upload.ejs', {
      title: '上传文件',
      files: files,
      layout: 'layout_admin.ejs'
    });
  });
 
});

app.post('/admin/upload', checkAuth, function(req, res) {
  // 获得文件的临时路径
  var tmp_path = req.files.thumbnail.path;
  // 指定文件上传后的目录 - 示例为"images"目录。 
  var target_path = './public/images/' + req.files.thumbnail.name;
  // 移动文件
  fs.rename(tmp_path, target_path, function(err) {
    if (err) throw err;
    // 删除临时文件夹文件, 
    fs.unlink(tmp_path, function() {
        if (err) throw err;
        //res.send('文件上传至: ' + target_path + '，文件大小：' + req.files.thumbnail.size + ' 字节');
        res.redirect('/admin/upload');
    });
  });
}); 

app.get('/admin/upload/delete/:filename', checkAuth, function(req, res) {
  fs.unlink(__dirname + '/public/images/' + req.params.filename, function(err) {
    
  });
  res.redirect('/admin/upload');
});

// rename
app.post('/admin/upload/rename', checkAuth, function(req, res) {
  fs.rename(__dirname + '/public/images/' + req.body.oldfilename, 
    __dirname + '/public/images/' + req.body.newfilename, 
    function(err) {
    res.redirect('/admin/upload');
  });
});

app.get('/admin/blog', checkAuth, function(req, res) {
  articleProvider.findArchives(function(err, result) {
    res.render('admin/blog/admin_blog_index.ejs', {
      title: '管理文章',
      layout: 'layout_admin.ejs',
      archives: result
    });
  });
});

app.get('/admin/blog/new', checkAuth, function(req, res) {
  res.render('admin/blog/admin_blog_new.ejs', {
    title: '发布新文章',
    layout: 'layout_admin.ejs'
  });
});

app.post('/admin/blog/new', checkAuth, function(req, res) {
  articleProvider.save({
    title: req.body.title,
    body: req.body.body
  }, function(err, docs) {
    res.redirect('/admin/blog');
  });
});

app.get('/admin/blog/update/:id', checkAuth, function(req, res) {
  articleProvider.findById(req.params.id, function(err, article) {
    res.render('admin/blog/admin_blog_update.ejs', {
      title: '更新文章',
      layout: 'layout_admin.ejs',
      article: article
    });
  });
});

app.post('/admin/blog/update', checkAuth, function(req, res) {
  articleProvider.update(req.body._id, req.body.title, req.body.body, function(err) {
    res.redirect('/admin/blog/'+req.body._id);
  });
});

app.post('/admin/blog/preview', checkAuth, function(req, res) {
    res.render('admin/blog/admin_blog_preview.ejs', {locals: {
      title: '文章预览',
      article_title: req.body.title,
      article_body: req.body.body
    }});
});

app.get('/admin/blog/delete/:id', checkAuth, function(req, res) {
  articleProvider.delete(req.params.id, function(err) {
    res.redirect('/admin/blog');
  });
});

app.get('/admin/blog/:id', checkAuth, function(req, res) {
  articleProvider.findById(req.params.id, function(err, article) {
    res.render('admin/blog/admin_blog.ejs',{
        title: article.title,
        layout: 'layout_admin.ejs',
        article: article
    });
  });
});

app.get('/admin/follow', checkAuth, function(req, res) {
  followProvider.findAll(function(err, result) {
    res.render('admin/follow/admin_follow_index.ejs', {
      title: '管理关注的博客',
      layout: 'layout_admin.ejs',
      follows: result
    });
  });
});

app.get('/admin/follow/new', checkAuth, function(req, res) {
  res.render('admin/follow/admin_follow_new.ejs', {
    title: '发布新关注的博客',
    layout: 'layout_admin.ejs',
  });
});

app.post('/admin/follow/new', checkAuth, function(req, res) {
  followProvider.save({
    url: req.body.url,
    name: req.body.name,
    comment: req.body.comment
  }, function(err, docs) {
    res.redirect('/admin/follow');
  });
});

app.get('/admin/follow/delete/:id', checkAuth, function(req, res) {
  followProvider.delete(req.params.id, function(err) {
    res.redirect('/admin/follow');
  });
});

app.get('/admin/login', function(req, res) {
  if(req.session.user_id !== undefined) {
    res.redirect('/admin');
  } else {
    res.render('admin/login.ejs', {locals: {
      title: '用户登陆'
    }});
  }
});

app.post('/admin/login', function(req, res) {
  var post = req.body;
  if(post.username == 'john' && post.pass == 'pass') {
    req.session.user_id = 'john';
    if(req.session.previous_url !== undefined) {
      res.redirect(req.session.previous_url);
    } else {
      res.redirect('/admin');
    }
  } else {
    res.send('Bad username/password');
  }
});
app.get('/admin/logout', function(req, res) {
  delete req.session.user_id;
  res.redirect('/');
});

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
