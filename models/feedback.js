/**
 * Created by merlin on 16/3/12.
 */
var mongodb = require('./db');

function Feedback(name,tel,email,content){
    this.name = name;
    this.tel = tel;
    this.email = email;
    this.content = content;
}

module.exports = Feedback;

Feedback.getTwenty = function(page,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取反馈
        db.collection('feedbacks',function(err,collection){
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
