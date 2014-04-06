var express = require('express');
var http = require('http');
var connect = require('express/node_modules/connect');
var lessMiddleware = require('less-middleware');
var MongoStore = require('connect-mongo')(express);
var join = require("path").join;
var db = require('./lib/db').db;

var app = express();
var cookieParser = express.cookieParser('secret');
var sessionStore = new MongoStore({
    db: db
});

var publicDir;

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(cookieParser);
    app.use(express.session({ store: sessionStore }));
});

app.configure('development', function () {
    publicDir = join(__dirname, "public");
    app.use(lessMiddleware({
        src: publicDir + '/styles',
        dest: publicDir,
        sourceMap: true
    }));
    app.use(express.static(publicDir));
    // for less source maps
    app.use('/' + publicDir.replace(/\\/g, '/'), express.static(publicDir));
});

app.configure('production', function () {
    publicDir = join(__dirname, "build");
    app.use(express.static(publicDir, { maxAge: 86400000 }));
});

var server = http.createServer(app);

var io = require('./lib/socket')(server, cookieParser, sessionStore);

require('./lib/auth')(app);
require('./lib/chat')(app, io);

app.get('*', function (req, res) {
    res.sendfile(join(publicDir, 'index.html'));
});

server.listen(8000, function () {
    console.log('Server listening on port ' + 8000);
});
