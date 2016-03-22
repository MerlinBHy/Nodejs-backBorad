var settings = require('../settings'),
        Db = require('mongodb').Db,
        ObjectID = require('mongodb').ObjectID,
        Connection = require('mongodb').Connection,
        Server = require('mongodb').Server;
    module.exports = new Db(settings.db, new Server(settings.host, settings.port),{safe: true});