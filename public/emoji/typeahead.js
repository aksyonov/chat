angular.module('chatApp.emoji.typeahead', [
        'mgcrea.ngStrap.tooltip',
        'chatApp.emoji'
    ])

    .provider('$emTypeahead', function () {

        var defaults = this.defaults = {
            animation: 'am-fade',
            prefixClass: 'typeahead',
            placement: 'top-left',
            template: 'emoji/typeahead.html',
            trigger: 'manual',
            container: false,
            keyboard: true,
            html: false,
            delay: 0,
            minLength: 1,
            filter: 'filter',
            limit: 6
        };

        this.$get = function ($window, $rootScope, $tooltip) {

            var bodyEl = angular.element($window.document.body);

            function TypeaheadFactory(element, config) {

                var $typeahead = {};

                // Common vars
                var options = angular.extend({}, defaults, config);
                var controller = options.controller;

                $typeahead = $tooltip(element, options);
                var parentScope = config.scope;
                var scope = $typeahead.$scope;

                scope.$matches = [];
                scope.$activeIndex = 0;

                scope.$activate = function (index) {
                    scope.$$postDigest(function () {
                        $typeahead.activate(index);
                    });
                };

                scope.$select = function (index, evt) {
                    scope.$$postDigest(function () {
                        $typeahead.select(index);
                    });
                };

                scope.$isVisible = function () {
                    return $typeahead.$isVisible();
                };

                // Public methods

                $typeahead.update = function (matches) {
                    scope.$matches = matches;
                    if (scope.$activeIndex >= matches.length) {
                        scope.$activeIndex = 0;
                    }
                };

                $typeahead.activate = function (index) {
                    scope.$activeIndex = index;
                };

                $typeahead.select = function (index) {
                    if (angular.isUndefined(index)) return;
                    var value = scope.$matches[index].value,
                        label = scope.$matches[index].label;
                    if (controller) {
                        var text = controller.$viewValue.split(':');
                        text.pop();
                        text.push(label.slice(1));
                        controller.$setViewValue(text.join(':'));
                        controller.$render();
                        if (parentScope) parentScope.$digest();
                    }
                    if ($typeahead.$isShown) $typeahead.hide();
                    scope.$activeIndex = 0;
                    // Emit event
                    scope.$emit('$typeahead.select', value, index);
                };

                // Protected methods

                $typeahead.$isVisible = function () {
                    if (!options.minLength || !controller) {
                        return !!scope.$matches.length;
                    }
                    // minLength support
                    return scope.$matches.length && angular.isString(controller.$viewValue) && controller.$viewValue.length >= options.minLength;
                };

                $typeahead.$onMouseDown = function (evt) {
                    // Prevent blur on mousedown
                    evt.preventDefault();
                    evt.stopPropagation();
                };

                $typeahead.$onKeyDown = function (evt) {
                    if (!/(38|40|13)/.test(evt.keyCode)) return;
                    evt.preventDefault();
                    evt.stopPropagation();

                    // Select with enter
                    if (evt.keyCode === 13) {
                        return $typeahead.select(scope.$activeIndex);
                    }

                    // Navigate with keyboard
                    if (evt.keyCode === 38 && scope.$activeIndex > 0) scope.$activeIndex--;
                    else if (evt.keyCode === 40 && scope.$activeIndex < scope.$matches.length - 1) scope.$activeIndex++;
                    else if (angular.isUndefined(scope.$activeIndex)) scope.$activeIndex = 0;
                    scope.$digest();
                };

                $typeahead.$onKeyPress = function (evt) {
                    if (evt.keyCode !== 58) return;
                    $typeahead.show();
                    element[0].focus();
                };

                // Overrides

                var _show = $typeahead.show;
                $typeahead.show = function () {
                    _show();
                    setTimeout(function () {
                        $typeahead.$element.on('mousedown', $typeahead.$onMouseDown);
                        if (options.keyboard) {
                            element.on('keydown', $typeahead.$onKeyDown);
                        }
                    });
                };

                var _hide = $typeahead.hide;
                $typeahead.hide = function () {
                    $typeahead.$element.off('mousedown', $typeahead.$onMouseDown);
                    if (options.keyboard) {
                        element.off('keydown', $typeahead.$onKeyDown);
                    }
                    _hide();
                };

                element.on('keypress', $typeahead.$onKeyPress);

                var _destroy = $typeahead.destroy;
                $typeahead.destroy = function () {
                    element.off('keypress', $typeahead.$onKeyPress);
                    _destroy();
                };

                return $typeahead;

            }

            TypeaheadFactory.defaults = defaults;
            return TypeaheadFactory;

        };

    })

    .directive('emTypeahead', function ($window, $q, $emTypeahead, emojis) {

        var defaults = $emTypeahead.defaults;

        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function postLink(scope, element, attr, controller) {

                // Directive options
                var options = {scope: scope, controller: controller};
                angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'filter', 'limit', 'minLength'], function (key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                var limit = options.limit || defaults.limit;

                // Initialize typeahead
                var typeahead = $emTypeahead(element, options);

                // Watch model for changes
                scope.$watch(attr.ngModel, function (newValue, oldValue) {
                    if (newValue.indexOf(':') < 0) return typeahead.update([]);
                    var text = newValue.split(':').pop();
                    var values = emojis.list.filter(function (name) {
                        return name.lastIndexOf(text, 0) === 0;
                    }).map(function (name) {
                        return {
                            label: ':' + name + ':',
                            value: name
                        };
                    });
                    if (values.length > limit) values = values.slice(0, limit);
                    typeahead.update(values);
                });

                // Garbage collection
                scope.$on('$destroy', function () {
                    typeahead.destroy();
                    options = null;
                    typeahead = null;
                });

            }
        };

    });
