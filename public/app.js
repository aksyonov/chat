angular.module('chatApp', [
        'ngRoute',
        'ngAnimate',
        'btford.socket-io',
        'chatApp.chat'
    ])

    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
        $routeProvider
            .when('/', {
                controller: 'ChatCtrl',
                templateUrl: 'chat/chat.html'
            })
            .when('/login', {
                controller: 'LoginCtrl',
                templateUrl: 'templates/login.html'
            })
            .when('/logout', {
                controller: 'LogoutCtrl',
                template: ' '
            });
    })

    .factory('socket', function (socketFactory) {
        var socket = io.connect();
        var factory = socketFactory({
            ioSocket: socket
        });
        factory.s = socket;
        return factory;
    })

    .run(function (socket, $location, $rootScope) {
        socket.on('login:unauthorized', function () {
            socket.s.disconnect();
            $location.path("/login");
        });
        socket.on('login:success', function (user) {
            $location.path("/");
            $rootScope.loggedIn = true;
        });
    })

    .controller('LoginCtrl', function ($scope, $http, $location, socket) {
        $scope.login = function () {
            $http.post('/login', {
                username: $scope.name,
                password: $scope.pass
            }).then(function (res) {
                if (res.data === 'ok') {
                    socket.s.socket.connect();
                } else {
                    $scope.err = res.data;
                }
            });
        };
    })

    .controller('LogoutCtrl', function ($http, $location, $rootScope, socket) {
        $http.post('/logout').then(function (res) {
            socket.s.disconnect();
            $location.path("/login");
            $rootScope.loggedIn = false;
        });
    })
