var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Product = require('../models/product.js'),
    Feedback = require('../models/feedback.js');

var formidable = require('formidable');
module.exports = function(app) {
app.get('/',checkLogin);
app.get('/', function (req, res) {
  //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = parseInt(req.query.p) || 1;
  //查询并返回第 page 页的 10 篇文章
  Post.getTen(null, page, function (err, posts, total) {
    if (err) {
      posts = [];
    } 
    res.render('index', {
      title: '主页',
      posts: posts,
      page: page,
      isFirstPage: (page - 1) == 0,
      isLastPage: ((page - 1) * 10 + posts.length) == total,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

  app.get('/feedback',checkLogin);
  app.get('/feedback', function(req, res){
    var page = parseInt(req.query.p) || 1;
    Feedback.getTwenty(page,function(err,feedbacks,total){
      if(err){
        feedbacks = [];
      }
      res.render('feedback',{
        title:'反馈',
        feedbacks:feedbacks,
        page:page,
        isFirstPage:(page - 1) == 0,
        isLastPage:((page - 1) * 20 + feedbacks.length) == total,
        user:req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/products',checkLogin);
  app.get('/products',function(req,res){
    var page = parseInt(req.query.p) || 1;
    Product.getTwenty(page,function(err,products,total){
      if(err){
        products = [];
      }
      res.render('products',{
        title:'产品信息',
        products:products,
        page:page,
        isFirstPage:(page - 1) == 0,
        isLastPage:((page - 1) * 20 + products.length) == total,
        user:req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });

  });

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!'); 
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');
      }
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    }); 
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!'); 
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表新闻',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    if(req.body.title == ""){
      req.flash('error','标题不能为空!');
      return res.redirect("/");
    }
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.synopsis,req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');//发表成功跳转到主页
    });
  });

  app.post('/addProduct',checkLogin);
  app.post('/addProduct',function(req,res){

    if(req.body.title == ""){
      req.flash('error','名称不能为空!');
      return res.redirect("/products");
    }
    var currentUser = req.session.user,
        product = new Product(currentUser.name,req.body.imageUrl,req.body.title,req.body.synopsis,req.body.post);
    product.save(function(err){
      if (err) {
        req.flash('error', err);
        return res.redirect('/products');
      }
      req.flash('success', '发布成功!');
      res.redirect('/products');//发表成功跳转到主页
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });

  app.post('/uploadImg',function(req,res,next){
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/../public/images';
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files.imgFile;
        var path = image.path;
        path = path.replace('/\\/g', '/');
        var url = '/images' + path.substr(path.lastIndexOf('/'), path.length);
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
  });

app.get('/u/:name', function (req, res) {
  var page = parseInt(req.query.p) || 1;
  //检查用户是否存在
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/');
    }
    //查询并返回该用户第 page 页的 10 篇文章
    Post.getTen(user.name, page, function (err, posts, total) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      } 
      res.render('user', {
        title: user.name,
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  }); 
});

  app.get('/u/:name/:day/:title',function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title ,function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/editProduct/:name/:title/:time',checkLogin);
  app.get('/editProduct/:name/:title/:time',function(req,res){
    var currentUser = req.session.user;
    Product.edit(currentUser.name,req.params.title,req.params.time,function(err,product){
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      console.log(product);
      res.render('editProduct', {
        title: '编辑产品',
        product: product,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/product/:name/:title/:time',checkLogin);
  app.get('/product/:name/:title/:time',function(req,res){
    var currentUser = req.session.user;
    Product.getOne(currentUser.name,req.params.title,req.params.time,function(err,p){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      res.render('productDetail',{
        title:'产品信息',
        product: p,
        user:req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });

  app.post('/editProduct/:name/:title/:time',checkLogin);
  app.post('/editProduct/:name/:title/:time',function(req,res){
    var currentUser = req.session.user;
    Product.update(currentUser.name,req.body.imageUrl,req.params.title,req.body.post,req.body.synopsis,req.params.time,function(err){
      if (err) {
        req.flash('error', err);
        return res.redirect("/products");//出错！
      }
      req.flash('success', '修改成功!');
      res.redirect("/products");//成功！
    });
  });

  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });

  app.get('/removeProduct/:name/:title/:time',checkLogin);
  app.get('/removeProduct/:name/:title/:time',function(req,res){
    var currentUser = req.session.user;
    Product.remove(currentUser.name,req.params.title,req.params.time,function(err){
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/products');
    });
  });

  app.get('/addProduct',checkLogin);
  app.get('/addProduct',function(req,res){
    res.render('product',{
      title:'添加产品',
      user:req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }


};