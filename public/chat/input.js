angular.module('chatApp.chat.input', [
        'chatApp.emoji.popover',
        'chatApp.emoji.typeahead'
    ])

    .directive('chatInput', function(socket) {
        return {
            restrict: 'E',
            templateUrl: 'chat/input.html',
            replace: true,
            link: function (scope, element, attr) {
                scope.message = '';
                scope.send = function () {
                    socket.emit('chat', scope.message);
                    scope.message = '';
                };
            }
        };
    })

    .directive('focusOn', function() {
        return function(scope, elem, attr) {
            scope.$on('focusOn', function(e, name) {
                if(name === attr.focusOn) {
                    elem[0].focus();
                }
            });
        };
    });
