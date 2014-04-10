angular.module('chatApp.chat', [
        'luegg.directives',
        'chatApp.emoji.popover',
        'chatApp.emoji.typeahead',
        'chatApp.emoji'
    ])
    .controller('ChatCtrl', function ($scope, socket, $filter) {
        $scope.rooms = [
            {
                name: 'General'
            },
            {
                name: 'JavaScript'
            },
            {
                name: 'PHP'
            },
            {
                name: 'Fun'
            }
        ];
        $scope.messages = [];
        $scope.message = '';
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
            data.text = $filter('emoji')(data.text);
            data.date = $filter('date')(data.date, 'HH:mm');
            $scope.messages.push(data);
        });
        $scope.$on('socket:room:online', function (e, data) {
            $scope.rooms[data.room].online = data.value;
        });
    })
    .filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });
