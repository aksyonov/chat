angular.module('chatApp.chat.createRoomModal', [
        'mgcrea.ngStrap.modal',
        'mgcrea.ngStrap.alert'
    ])
    .directive('chatRoomModal', function ($window, $sce, $modal, $alert) {
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
                    if (!scope.newRoom.name.trim()) {
                        alert = $alert(angular.extend({}, alertOpts, {
                            content: $sce.trustAsHtml('Name must not be empty!')
                        }));
                    }
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
