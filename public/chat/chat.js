angular.module('chatApp.chat', [
        'luegg.directives',
        'chatApp.emoji',
        'chatApp.chat.createRoomModal',
        'chatApp.chat.input'
    ])

    .service('chat', function (socket) {
        var self = this;
        var rooms = this.rooms = [];
        this.messages = [];
        this.currentRoom = '';

        rooms.find = function (name) {
            return this.filter(function(room) {
                return room.name === name;
            })[0];
        };

        socket.ngOn('chat', function (data) {
            self.messages.push(data);
        });

        socket.ngOn('rooms:new', function (data) {
            rooms.push(data);
        });

        socket.ngOn('rooms:list', function (data) {
            rooms.splice.apply(rooms, [0, rooms.length].concat(data));
        });

        socket.ngOn('rooms:remove', function (name) {
            var room = rooms.find(name);
            if (room) {
                rooms.splice(rooms.indexOf(room), 1);
            }
        });

        socket.ngOn('room:online', function (data) {
            var room = rooms.find(data.name);
            room.online = data.value;
        });

        socket.ngOn('room:current', function (room, messages) {
            self.currentRoom = room;
            self.messages = messages;
        });

        this.start = function () {
            socket.emit('start');
        }
    })

    .controller('ChatCtrl', function ($scope, socket, chat) {
        $scope.chat = chat;

        $scope.changeRoom = function (id, pass) {
            var newRoom = chat.rooms.find(id);
            if (newRoom.pass && !pass) {
                pass = prompt('Enter password for room ' + id);
            }
            socket.ngEmit('room:change', {
                name: id,
                pass: pass
            }, function (result) {
                if (typeof result == 'string') {
                    alert(result);
                    return;
                }
                chat.currentRoom = id;
                chat.messages = result;
            }, $scope);
        };
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
