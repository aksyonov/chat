angular.module('chatApp.chat', ['luegg.directives'])
    .controller('ChatCtrl', function ($scope, socket) {
        $scope.messages = [];
        socket.forward('chat', $scope);
        $scope.$on('socket:chat', function (e, data) {
            $scope.messages.push(data);
        });
        $scope.send = function () {
            socket.emit('chat', $scope.message);
            $scope.message = '';
        };
    })
