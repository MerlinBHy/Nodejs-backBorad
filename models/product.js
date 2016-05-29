/**
 * Created by merlin on 16/3/22.
 */
var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Product(name,imageUrl, title, synopsis,type,producer,post) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.title = title;
    this.synopsis = synopsis;
    this.type = type;
    this.post = post;
    this.producer = producer;
    var date = new Date();
    this.time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "-" + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
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
        post: this.post,
        time:this.time,
        type:this.type,
        producer:this.producer
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

Product.edit = function(p_id,callback) {
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
               "_id":new ObjectID(p_id)
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
Product.getOne = function(p_id,callback){
    console.log(p_id);
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id":new ObjectID(p_id)
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                console.log(doc);
                callback(null,doc);
            });
        });
    });
};

Product.update = function(name,imageUrl, p_id, post,synopsis,type,producer,callback) {
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
                "_id":new ObjectID(p_id)
            }, {
                $set: {post: post,imageUrl:imageUrl,synopsis:synopsis,type:type,producer:producer}
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

Product.remove = function(p_id,callback) {
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
                "_id":new ObjectID(p_id)
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

