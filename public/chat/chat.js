angular.module('chatApp.chat', [
        'luegg.directives',
        'chatApp.emoji',
        'chatApp.chat.createRoomModal',
        'chatApp.chat.input'
    ])

    .controller('ChatCtrl', function ($scope, socket) {
        var rooms = $scope.rooms = [];
        $scope.messages = [];
        $scope.currentRoom = 0;

        $scope.changeRoom = function (id, pass) {
            var newRoom = rooms.find(id);
            if (newRoom.pass && !pass) {
                pass = prompt('Enter password for room ' + id);
            }
            socket.emit('room:change', {
                name: id,
                pass: pass
            }, function (result) {
                if (typeof result == 'string') {
                    alert(result);
                    return;
                }
                $scope.currentRoom = id;
                $scope.messages = result;
            });
        };

        rooms.find = function (name) {
            return this.filter(function(room) {
                return room.name === name;
            })[0];
        };

        socket.forward([
            'chat',
            'rooms:new',
            'rooms:list',
            'rooms:remove',
            'room:online',
            'room:current'
        ], $scope);

        $scope.$on('socket:chat', function (e, data) {
            $scope.messages.push(data);
        });

        $scope.$on('socket:rooms:new', function (e, data) {
            rooms.push(data);
        });

        $scope.$on('socket:rooms:list', function (e, data) {
            rooms.splice.apply(rooms, [0,0].concat(data));
        });

        $scope.$on('socket:rooms:remove', function (e, name) {
            var room = rooms.find(name);
            if (room) {
                rooms.splice(rooms.indexOf(room), 1);
            }
        });

        $scope.$on('socket:room:online', function (e, data) {
            var room = rooms.find(data.name);
            room.online = data.value;
        });

        $scope.$on('socket:room:current', function (e, data) {
            var room = data[0],
                messages = data[1];
            $scope.currentRoom = room;
            $scope.messages = messages;
        });

        socket.emit('start');
    })

    .directive('chatMessages', function() {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'chat/messages.html'
        };
    })

    .directive('chatRooms', function() {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'chat/rooms.html'
        };
    });
