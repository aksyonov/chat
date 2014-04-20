angular.module('chatApp.socket', [])

    .factory('socket', function ($rootScope) {
        var socket = io.connect();

        function applyWrap(fn, scope) {
            return function () {
                var arg = [].slice.call(arguments);
                scope.$apply(function () {
                    fn.apply(null, arg);
                });
            }
        }

        socket.ngOn = function (name, cb, scope) {
            scope = scope || $rootScope;
            var listener = applyWrap(cb, scope);
            socket.on(name, listener);
            scope.$on('$destroy', function() {
                socket.removeListener(name, listener);
            });
        };

        socket.ngEmit = function () {
            var args, last
                scope = $rootScope;

            args = [].slice.call(arguments);
            last = args.length - 1;
            // if last argument is scope
            if (args[last].$root) {
                scope = args.splice(last)[0];
                last--;
            }
            if (typeof args[last] === 'function') {
                args[last] = applyWrap(args[last], scope);
            }
            socket.emit.apply(socket, args);
        };

        return socket;
    })
