angular.module('chat', [
  'ngRoute',
  'btford.socket-io'
])

.config(function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $routeProvider
    .when('/', {
      controller:'MainCtrl',
      templateUrl:'/templates/main.html'
    })
    .when('/chat', {
      controller:'ChatCtrl',
      templateUrl:'/templates/chat.html'
    })
    .when('/login', {
      controller:'LoginCtrl',
      templateUrl:'/templates/login.html'
    })
    .when('/logout', {
      controller:'LogoutCtrl'
    })
    .otherwise({
      redirectTo:'/'
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

.controller('MainCtrl', function (socket, $location) {
  socket.on('login:unauthorized', function () {
    socket.s.disconnect();
    $location.path("/login");
  });
  socket.on('login:success', function (user) {
    $location.path("/chat");
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
        $location.path("/chat");
      } else {
        $scope.err = res.data;
      }
    });
  };
})

.controller('ChatCtrl', function () {

})

.controller('LogoutCtrl', function () {

});
