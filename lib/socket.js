module.exports = function (server, cookieParser, sessionStore) {
    var io = require('socket.io').listen(server);
    var SessionSockets = require('session.socket.io');
    var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

    sessionSockets.on('connection', function (err, socket, session) {
        var found;
        if (err || !session.user) {
            socket.emit('login:unauthorized');
            return;
        }
        found = io.sockets.clients().some(function (client) {
            if (client.session && client.session.user === session.user) {
                return true;
            }
        });
        if (found) {
            socket.emit('login:playing');
            return;
        }
        socket.emit('login:success', session.user);

        socket.session = session;
        socket.on('start', function () {
            io.sockets.$emit('session:connection', socket);
        });
    });

    return io;
};
