var sanitizer = require('sanitizer');
var db = require('./db');

var rooms = {'Default': 0};

module.exports = function (app, io) {
    io.sockets.on('start', function start(socket) {
        var session = socket.session,
            user = socket.user,
            room = user.room || 'Default';

        function changeRoom(id) {
            io.sockets.emit('room:online', {
                room: room,
                value: --rooms[room]
            });
            socket.leave(room);
            if (rooms[room] == 0) {
                delete rooms[room];
            }
            room = id;
            socket.join(room);
            io.sockets.emit('room:online', {
                room: room,
                value: ++rooms[room]
            });
        }

        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = 0;
        }
        socket.emit('rooms', rooms);
        socket.emit('room:current', room);
        io.sockets.emit('room:online', {
            room: room,
            value: ++rooms[room]
        });

        socket.on('chat', function (message) {
            var date = new Date();
            message = sanitizer.sanitize(message);
            io.sockets.in(room).emit('chat', {
                user: session.user,
                text: message,
                date: date
            });
        });

        socket.on('room:change', changeRoom);

        socket.on('room:create', function (id, cb) {
            if (!id.trim()) {
                return cb('Name must not be empty!');
            }
            if (rooms.hasOwnProperty(id)) {
                return cb('This room already exists!');
            }
            rooms[id] = 0;
            changeRoom(id);
            socket.emit('room:current', room);
            cb('ok');
        });

        socket.on('disconnect', function () {
            io.sockets.emit('room:online', {
                room: room,
                value: --rooms[room]
            });
            if (rooms[room] == 0) {
                delete rooms[room];
            }
        });
    });
};
