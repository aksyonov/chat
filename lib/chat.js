var sanitizer = require('sanitizer');

var rooms = [0, 0, 0, 0];

module.exports = function (app, io) {
    io.sockets.on('session:connection', function (socket) {
        var session = socket.session,
            roomId = 0,
            room = 'room' + roomId;

        socket.join(room);
        io.sockets.emit('room:online', {
            room: roomId,
            value: ++rooms[roomId]
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
        socket.on('room:change', function (id) {
            io.sockets.emit('room:online', {
                room: roomId,
                value: --rooms[roomId]
            });
            socket.leave(room);
            roomId = id;
            room = 'room' + roomId;
            socket.join(room);
            io.sockets.emit('room:online', {
                room: roomId,
                value: ++rooms[roomId]
            });
        });

        socket.on('disconnect', function () {
            io.sockets.emit('room:online', {
                room: roomId,
                value: --rooms[roomId]
            });
        });
    });
};
