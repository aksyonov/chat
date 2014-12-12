var sanitizer = require('sanitizer');
var db = require('./db');

var rooms = [];

function errorHandler(err) {
    if (err) throw err;
}
db.promise.then(function () {
    db.rooms.find({}, {
         name: 1, pass: 1
    }).toArray(function (err, roomsInDB) {
        rooms = roomsInDB.map(function (room) {
            room.online = 0;
            return room;
        });
        rooms.find = function (name) {
            return this.filter(function(room) {
                return room.name === name;
            })[0];
        };
    });
});


module.exports = function (io, socket) {
    var session = socket.session,
        user = socket.user,
        roomName = user.room || 'Default',
        currentRoom = rooms.find(roomName);


    function leaveRoom() {
        io.sockets.emit('room:online', {
            name: roomName,
            value: --currentRoom.online
        });
        socket.leave(roomName);

        if (currentRoom.online == 0 && !currentRoom._id) {
            io.sockets.emit('rooms:remove', roomName);
            rooms.splice(rooms.indexOf(currentRoom), 1);
        }
    }

    function getCurrentRoomMessages(cb) {
        if (!currentRoom._id) {
            cb(null, currentRoom.messages);
        } else {
            //var today = new Date();
            //today.setHours(0, 0, 0, 0);
            db.rooms.findOne({
                _id: currentRoom._id,
                //'messages.date': {$gt: today}
            }, function (err, room) {
                if (err) return cb(err);
                if (room) {
                    cb(null, room.messages);
                } else {
                    cb(null, []);
                }
            });
        }
    }

    socket.emit('rooms:list', rooms.map(function (room) {
        return {
            name: room.name,
            online: room.online,
            pass: !!room.pass
        };
    }));

    if (!currentRoom) {
        roomName = 'Default';
        currentRoom = rooms.find('Default');
    }
    socket.join(roomName);
    getCurrentRoomMessages(function (err, messages) {
        socket.emit('room:current', roomName, messages);
    });

    io.sockets.emit('room:online', {
        name: roomName,
        value: ++currentRoom.online
    });

    socket.on('chat', function (message) {
        if (!message.trim()) return;

        var date = new Date();
        message = sanitizer.sanitize(message);
        message = {
            user: session.user,
            text: message,
            date: date
        };
        if (!currentRoom._id) {
            currentRoom.messages.push(message);
        } else {
            db.rooms.update({_id: currentRoom._id}, {
                $push: {messages: message}
            }, errorHandler);
        }
        io.sockets.in(roomName).emit('chat', message);
    });

    socket.on('room:change', function changeRoom(data, cb) {
        var newRoom = rooms.find(data.name);
        if (newRoom.pass && newRoom.pass !== data.pass) {
            return cb('Wrong password');
        }
        leaveRoom();
        roomName = data.name;
        currentRoom = newRoom;
        socket.join(roomName);
        io.sockets.emit('room:online', {
            name: roomName,
            value: ++currentRoom.online
        });
        db.users.update({_id: user._id}, {$set: {room: roomName}}, errorHandler);
        getCurrentRoomMessages(function (err, messages) {
            cb(messages);
        });
    });

    socket.on('room:create', function (newRoom, cb) {
        if (!newRoom.name.trim()) {
            return cb('Name must not be empty!');
        }
        if (rooms.find(newRoom.name)) {
            return cb('This room already exists!');
        }
        newRoom.online = 0;
        newRoom.messages = [];
        if (newRoom.permanent) {
            exports.rooms.insert({
                name: newRoom.name,
                messages: []
            }, function (err, inserted) {
                newRoom._id = inserted._id;
                end();
            });

        } else {
            end();
        }
        function end() {
            rooms.push(newRoom);
            io.sockets.emit('rooms:new', {
                name: newRoom.name,
                online: newRoom.online,
                pass: !!newRoom.pass
            });
            cb('ok');
        }
    });

    socket.on('disconnect', leaveRoom);
};
