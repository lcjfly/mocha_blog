
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    ArticleProvider = require('./articleprovider-memory').ArticleProvider;

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
app.get('/', function(req, res) {
  articleProvider.findAll(function(err, docs) {
    res.render('index.ejs', {locals: {
      title: 'Blog',
      articles: docs
    }});
  });
});

app.get('/blog/new', function(req, res) {
  res.render('blog_new.ejs', {locals: {
    title: 'New Post'
  }
  })
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