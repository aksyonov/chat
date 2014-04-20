var sanitizer = require('sanitizer');
var db = require('./db');

var rooms = [{
    name: 'Default',
    online: 0,
    permanent: true,
    messages: []
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

            if (currentRoom.online == 0 && !currentRoom.permanent) {
                io.sockets.emit('rooms:remove', room);
                rooms.splice(rooms.indexOf(currentRoom), 1);
            }
        }

        socket.emit('rooms:list', rooms.map(function (room) {
            return {
                name: room.name,
                online: room.online,
                pass: !!room.pass
            }
        }));

        if (!currentRoom) {
            room = 'Default';
            currentRoom = rooms.find('Default');
        }
        socket.join(room);
        socket.emit('room:current', room, currentRoom.messages);

        io.sockets.emit('room:online', {
            name: room,
            value: ++currentRoom.online
        });

        socket.on('chat', function (message) {
            var date = new Date();
            message = sanitizer.sanitize(message);
            message = {
                user: session.user,
                text: message,
                date: date
            };
            currentRoom.messages.push(message);
            io.sockets.in(room).emit('chat', message);
        });

        socket.on('room:change', function changeRoom(data, cb) {
            var newRoom = rooms.find(data.name);
            if (newRoom.pass && newRoom.pass !== data.pass) {
                return cb('Wrong password');
            }
            leaveRoom();
            room = data.name;
            currentRoom = newRoom;
            socket.join(room);
            io.sockets.emit('room:online', {
                name: room,
                value: ++currentRoom.online
            });
            cb(currentRoom.messages);
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
            rooms.push(newRoom);
            io.sockets.emit('rooms:new', {
                name: newRoom.name,
                online: newRoom.online,
                pass: !!newRoom.pass
            });
            cb('ok');
        });

        socket.on('disconnect', leaveRoom);
    });
};
