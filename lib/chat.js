module.exports = function (app, io) {
    var online = 0;

    io.sockets.on('session:connection', function (socket) {
        var session = socket.session;

        socket.broadcast.emit('user:in', session.user);
        io.sockets.emit('online', ++online);

        socket.on('disconnect', function () {
            socket.broadcast.emit('user:out', session.user);
            io.sockets.emit('online', --online);
        });

        socket.on('chat', function (message) {
            var date = new Date();
            io.sockets.emit('chat', {
                user: session.user,
                message: message,
                date: date
            });
        });
    });
}
