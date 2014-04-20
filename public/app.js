angular.module('chatApp', [
        'ngRoute',
        'ngAnimate',
        'pasvaz.bindonce',
        'chatApp.socket',
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

    .run(function ($location, $rootScope, socket, chat) {
        socket.ngOn('login:unauthorized', function () {
            $location.path("/login");
            socket.disconnect();
        });
        socket.ngOn('login:success', function (user) {
            $location.path("/");
            $rootScope.loggedIn = true;
            chat.start();
        });
    })

    .controller('LoginCtrl', function ($scope, $http, $location, socket) {
        $scope.login = function () {
            $http.post('/login', {
                username: $scope.name,
                password: $scope.pass
            }).then(function (res) {
                if (res.data === 'ok') {
                    socket.socket.connect();
                } else {
                    $scope.err = res.data;
                }
            });
        };
    })

    .controller('LogoutCtrl', function ($http, $location, $rootScope, socket) {
        $http.post('/logout').then(function (res) {
            socket.disconnect();
            $location.path("/login");
            $rootScope.loggedIn = false;
        });
    })
