angular.module('chatApp.chat', [
        'luegg.directives',
        'chatApp.emoji.popover',
        'chatApp.emoji.typeahead',
        'chatApp.emoji',
        'chatApp.chat.createRoomModal'
    ])
    .controller('ChatCtrl', function ($scope, socket, $filter) {
        $scope.rooms = {};
        $scope.messages = [];
        $scope.message = '';
        $scope.currentRoom = 0;
        socket.forward(['chat', 'room:online', 'room:current', 'rooms'], $scope);

        $scope.send = function () {
            socket.emit('chat', $scope.message);
            $scope.message = '';
        };
        $scope.changeRoom = function (id) {
            $scope.currentRoom = id;
            socket.emit('room:change', id);
            $scope.messages = [];
        };

        $scope.$on('socket:rooms', function (e, data) {
            $scope.rooms = data;
        });
        $scope.$on('socket:chat', function (e, data) {
            data.text = $filter('emoji')(data.text);
            data.date = $filter('date')(data.date, 'HH:mm');
            $scope.messages.push(data);
        });
        $scope.$on('socket:room:online', function (e, data) {
            if (data.value == 0) {
                delete $scope.rooms[data.room];
            } else {
                $scope.rooms[data.room] = data.value;
            }
        });
        $scope.$on('socket:room:current', function (e, room) {
            $scope.currentRoom = room;
        });

        socket.emit('start');
    })
    .filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });
