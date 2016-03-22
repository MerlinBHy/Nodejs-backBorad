/**
 * Created by merlin on 16/3/22.
 */
var mongodb = require('./db');

function Product(name,imageUrl, title, synopsis,post) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.title = title;
    this.synopsis = synopsis;
    this.post = post;
}

module.exports =  Product;

//存储一个产品信息
Product.prototype.save = function(callback) {
    //文档信息
    var product = {
        name:this.name,
        imageUrl:this.imageUrl,
        title: this.title,
        synopsis: this.synopsis,
        post: this.post
    };

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(product, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

Product.getTwenty = function(page,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取反馈
        db.collection('products',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            //使用count返回查询数目total
            collection.count(query,function(err,total){
                collection.find(query,{
                    skip:(page - 1) * 20,
                    limit:20
                }).sort({
                    time:-1
                }).toArray(function(err,docs){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    callback(null,docs,total);
                });
            });
        });
    });
};

Product.edit = function(name, title,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);
            });
        });
    });
};
Product.getOne = function(name,title,callback){
    console.log(name);
    console.log(title);
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection('products',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "name":name,
                "title":title
            },function(err,doc){
                mongodb.close();

                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};

Product.update = function(name,imageUrl, title, post,synopsis, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name": name,
                "title": title
            }, {
                $set: {post: post,imageUrl:imageUrl,synopsis:synopsis}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Product.remove = function(name, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.remove({
                "name": name,
                "title": title
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

