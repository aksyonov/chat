angular.module('chatApp.emoji.popover', ['mgcrea.ngStrap.tooltip'])

  .provider('$emPopover', function() {

    var defaults = this.defaults = {
      animation: 'am-fade-and-slide-bottom',
      placement: 'top',
      template: 'emoji/popover.html',
      contentTemplate: false,
      trigger: 'click',
      keyboard: true,
      html: false,
      title: '',
      content: '',
      delay: 0,
      container: false
    };

    this.$get = function($tooltip) {

      function PopoverFactory(element, config) {

        // Common vars
        var options = angular.extend({}, defaults, config);

        var $popover = $tooltip(element, options);

        // Support scope as string options [/*title, */content]
        if(options.content) {
          $popover.$scope.content = options.content;
        }

        return $popover;

      }

      return PopoverFactory;

    };

  })

  .directive('emPopover', function($window, $location, $sce, $emPopover, emojis) {

    var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;

    return {
      restrict: 'EAC',
      require: 'ngModel',
      template: '<i class="emoji emoji_smile"></i>',
      scope: {},
      link: function postLink(scope, element, attr, ngModel) {
        // Directive options
        var options = {scope: scope};
        angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation'], function(key) {
          if(angular.isDefined(attr[key])) options[key] = attr[key];
        });

        // Support scope as data-attrs
        angular.forEach(['title', 'content'], function(key) {
          attr[key] && attr.$observe(key, function(newValue, oldValue) {
            scope[key] = $sce.trustAsHtml(newValue);
            angular.isDefined(oldValue) && requestAnimationFrame(function() {
              popover && popover.$applyPlacement();
            });
          });
        });

        // Support scope as an object
        attr.bsPopover && scope.$watch(attr.bsPopover, function(newValue, oldValue) {
          if(angular.isObject(newValue)) {
            angular.extend(scope, newValue);
          } else {
            scope.content = newValue;
          }
          angular.isDefined(oldValue) && requestAnimationFrame(function() {
            popover && popover.$applyPlacement();
          });
        }, true);

        scope.emojis = emojis.popover;

        scope.apply = function (emoji) {
          var text = ngModel.$viewValue;
          ngModel.$setViewValue(text + ':' + emoji + ':');
          popover.hide();
        };

        // Initialize popover
        var popover = $emPopover(element, options);

        // Garbage collection
        scope.$on('$destroy', function() {
          popover.destroy();
          options = null;
          popover = null;
        });

      }
    };

  });
