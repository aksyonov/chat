var fs = require('fs');
var http = require('http');
var join = require("path").join;

var express = require('express');
var lessMiddleware = require('less-middleware');
var session = require('express-session');

var db = require('./lib/db').db;

var app = express();
var cookieParser = require('cookie-parser')('secret');
var MongoStore = require('connect-mongo')({session: session});
var sessionStore = new MongoStore({
    db: db
});

var publicDir;
var env = process.env.NODE_ENV || 'development';

app.use(require('body-parser')());
app.use(require('method-override')());
app.use(cookieParser);
app.use(session({ store: sessionStore }));

if ('development' == env) {
    publicDir = join(__dirname, "public");
    app.use(lessMiddleware({
        src: publicDir,
        dest: publicDir,
        sourceMap: true
    }));
    app.use(express.static(publicDir));
    // for less source maps
    app.use('/' + publicDir.replace(/\\/g, '/'), express.static(publicDir));
}

if ('production' == env) {
    publicDir = join(__dirname, "build");
    app.use(express.static(publicDir, { maxAge: 86400000 }));
}

var server = http.createServer(app);

var io = require('./lib/socket')(server, cookieParser, sessionStore);

require('./lib/auth')(app);
require('./lib/chat')(app, io);

app.get('*', function (req, res) {
    res.sendfile(join(publicDir, 'index.html'));
});

var port = process.env.PORT || 8000;
var oldUmask = process.umask(0);
if (fs.existsSync(port)) {
    fs.unlinkSync(port);
}
server.listen(port, function () {
    console.log('Server listening on port ' + port);
    process.umask(oldUmask);
});
