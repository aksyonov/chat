var sanitizer = require('sanitizer');
var db = require('./db');

var rooms = [{
    name: 'Default',
    online: 0,
    permanent: true
}];

rooms.find = function (name) {
    return this.filter(function(room) {
        return room.name === name;
    })[0];
};

module.exports = function (app, io) {
    io.sockets.on('start', function start(socket) {
        var session = socket.session,
            user = socket.user,
            room = user.room || 'Default',
            currentRoom = rooms.find(room);


        function leaveRoom() {
            io.sockets.emit('room:online', {
                name: room,
                value: --currentRoom.online
            });
            socket.leave(room);
            console.log(currentRoom.online, currentRoom.permanent);
            if (currentRoom.online == 0 && !currentRoom.permanent) {
                io.sockets.emit('rooms:remove', room);
                delete rooms[rooms.indexOf(currentRoom)];
            }
        }

        socket.emit('rooms:list', rooms);

        if (!currentRoom) {
            room = 'Default';
            currentRoom = rooms.find('Default');
        }
        socket.join(room);
        socket.emit('room:current', room);

        io.sockets.emit('room:online', {
            name: room,
            value: ++currentRoom.online
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

        socket.on('room:change', function changeRoom(id) {
            leaveRoom();
            room = id;
            currentRoom = rooms.find(room);
            socket.join(room);
            io.sockets.emit('room:online', {
                name: room,
                value: ++currentRoom.online
            });
        });

        socket.on('room:create', function (id, cb) {
            if (!id.trim()) {
                return cb('Name must not be empty!');
            }
            if (rooms.hasOwnProperty(id)) {
                return cb('This room already exists!');
            }
            var newRoom = {
                name: id,
                online: 0
            };
            rooms.push(newRoom);
            socket.emit('rooms:new', newRoom);
            cb('ok');
        });

        socket.on('disconnect', leaveRoom);
    });
};
