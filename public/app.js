angular.module('chat', [
        'ngRoute',
        'ngAnimate',
        'btford.socket-io'
    ])

    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
        $routeProvider
            .when('/chat', {
                controller: 'ChatCtrl',
                templateUrl: '/templates/chat.html'
            })
            .when('/login', {
                controller: 'LoginCtrl',
                templateUrl: '/templates/login.html'
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
        console.log('run');
        socket.on('login:unauthorized', function () {
            socket.s.disconnect();
            $location.path("/login");
        });
        socket.on('login:success', function (user) {
            $location.path("/chat");
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

    .controller('ChatCtrl', function ($scope, socket) {
        console.log('ctrl');
        $scope.messages = [];
        socket.forward('chat', $scope);
        $scope.$on('socket:chat', function (e, data) {
            $scope.messages.push(data);
        });
        $scope.send = function () {
            socket.emit('chat', $scope.message);
            $scope.message = '';
        };
    });
