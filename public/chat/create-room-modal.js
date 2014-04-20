angular.module('chatApp.chat.createRoomModal', [
        'mgcrea.ngStrap.modal',
        'mgcrea.ngStrap.alert'
    ])
    .directive('chatRoomModal', function ($window, $sce, $modal, $alert, socket) {
        var defaults = {
            animation: 'am-fade-and-slide-top',
            backdropAnimation: 'am-fade',
            template: 'chat/create-room-modal.html',
            container: 'body'
        };
        return {
            restrict: 'EAC',
            scope: true,
            link: function postLink(scope, element, attr, transclusion) {

                // Directive options
                var options = angular.extend({
                    scope: scope,
                    element: element,
                    show: false
                }, defaults, attr);

                // Initialize modal
                var modal = $modal(options);

                var show = modal.show;
                modal.show = function () {
                    // clear some objects before show
                    scope.newRoom = {name: '', pass: ''};

                    show.apply(modal);
                };

                // Trigger
                element.on(attr.trigger || 'click', modal.toggle);

                var alertOpts = {
                        type: 'danger',
                        container: '.modal .alerts-container'
                    },
                    alert;

                scope.create = function () {
                    alert && alert.destroy();
                    alert = undefined;
                    socket.ngEmit('room:create', scope.newRoom, function(res) {
                        if ('ok' == res) {
                            scope.changeRoom(scope.newRoom.name, scope.newRoom.pass);
                            return modal.hide();
                        }
                        alert = $alert(angular.extend({}, alertOpts, {
                            content: $sce.trustAsHtml(res)
                        }));
                    }, scope);
                };

                // Garbage collection
                scope.$on('$destroy', function () {
                    modal.destroy();
                    options = null;
                    modal = null;
                });

            }
        };

    });
