angular.module('chatApp.chat', [
        'luegg.directives',
        'chatApp.emoji.popover',
        'chatApp.emoji.typeahead',
        'chatApp.emoji',
        'chatApp.chat.createRoomModal'
    ])
    .controller('ChatCtrl', function ($scope, socket, $filter) {
        var rooms = $scope.rooms = [];
        $scope.messages = [];
        $scope.message = '';
        $scope.currentRoom = 0;

        $scope.send = function () {
            socket.emit('chat', $scope.message);
            $scope.message = '';
        };
        $scope.changeRoom = function (id) {
            $scope.currentRoom = id;
            socket.emit('room:change', id, function (messages) {
                messages.forEach(function (data) {
                    data.text = $filter('emoji')(data.text);
                    data.date = $filter('date')(data.date, 'HH:mm');
                });
                $scope.messages = messages;
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
            data.text = $filter('emoji')(data.text);
            data.date = $filter('date')(data.date, 'HH:mm');
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
            messages.forEach(function (data) {
                data.text = $filter('emoji')(data.text);
                data.date = $filter('date')(data.date, 'HH:mm');
            });
            $scope.messages = messages;
        });

        socket.emit('start');
    })
    .filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });
