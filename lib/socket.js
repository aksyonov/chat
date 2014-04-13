var db = require('./db');

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

        socket.emit('login:success', session.user);

        socket.session = session;

        socket.on('start', function () {
            db.users.findOne({login: session.user}, function (err, user) {
                socket.user = user;
                io.sockets.$emit('start', socket);
            });
        });
    });

    return io;
};
