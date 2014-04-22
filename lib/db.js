var Promise = require('promise');
var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var db = new Db('chat', new Server('127.0.0.1', 27017), {safe: true});
exports.db = db;
exports.users = db.collection('users');
exports.rooms = db.collection('rooms');

exports.promise = Promise.denodeify(db.open.bind(db))().then(function (db) {
    return new Promise(function (resolve, reject) {
        exports.rooms.findOne({name: 'Default'}, function (err, room) {
            if (room) {
                return resolve();
            }
            exports.rooms.insert({
                name: 'Default',
                messages: []
            }, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}, function (err) {
    throw err;
});
