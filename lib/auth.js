var crypto = require('crypto');
var db = require('./db');

function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('base64');
};

module.exports = function (app) {
    app.post('/login', function (req, res, next) {
        var login = req.body.username;
        var pass = req.body.password;
        if (!login || !pass) {
            return res.send('Send login and password');
        }
        db.users.findOne({login: login}, function (err, user) {
            if (err) next(err);
            var salt = Math.random() + '';
            if (!user) {
                db.users.insert({
                    login: login,
                    hash: encryptPassword(pass, salt),
                    salt: salt
                }, function (err) {
                    if (err) return next(err);
                    req.session.user = login;
                    res.send('ok');
                });
            } else if (user.hash !== encryptPassword(pass, user.salt)) {
                res.send('Wrong password');
            } else {
                req.session.user = user.login;
                res.send('ok');
            }
        });
    });
    app.post('/logout', function (req, res) {
        req.session.destroy();
        res.send('ok');
    });
}
