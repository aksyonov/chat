var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var db = new Db('chat', new Server('127.0.0.1', 27017));
exports.db = db;
exports.users = db.collection('users');

db.open(function(err, db) {
    if(err) throw err;
});
