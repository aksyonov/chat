angular.module('chatApp.chat', ['luegg.directives'])
    .controller('ChatCtrl', function ($scope, socket) {
        $scope.rooms = [
            {
                name: 'General'
            }, {
                name: 'JavaScript'
            }, {
                name: 'PHP'
            }, {
                name: 'Fun'
            }
        ];
        $scope.messages = [];
        $scope.currentRoom = 0;
        socket.forward(['chat', 'room:online'], $scope);

        $scope.send = function () {
            socket.emit('chat', $scope.message);
            $scope.message = '';
        };
        $scope.changeRoom = function (id) {
            $scope.currentRoom = id;
            socket.emit('room:change', id);
            $scope.messages = [];
        };

        $scope.$on('socket:chat', function (e, data) {
            $scope.messages.push(data);
        });
        $scope.$on('socket:room:online', function (e, data) {
            $scope.rooms[data.room].online = data.value;
        });
    })
