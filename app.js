
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    ArticleProvider = require('./articleprovider-memory').ArticleProvider,
    FollowProvider = require('./followProvider-memory').FollowProvider;
require('./date');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
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

// Routes
var articleProvider = new ArticleProvider('localhost', 27017);
var followProvider = new FollowProvider('localhost', 27017);

app.get('/', function(req, res) {
  articleProvider.findByPage(1, function(err, result) {
    res.render('index.ejs', {locals: {
      title: '我的博客',
      data: result
    }});
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
    title: '我关注的博客',
    follows: result
  }});
  });
});

app.get('/blog/new', function(req, res) {
  res.render('blog_new.ejs', {locals: {
    title: '发布新文章'
  }});
});

app.post('/blog/new', function(req, res) {
  articleProvider.save({
    title: req.body.title,
    body: req.body.body
  }, function(err, docs) {
    res.redirect('/');
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

app.post('/blog/addComment', function(req, res) {
  articleProvider.addCommentToArticle(req.body._id, {
    person: req.body.person,
    comment: req.body.comment,
    created_at: new Date()
  }, function(err, docs) {
    res.redirect('/blog/' + req.body._id);
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
