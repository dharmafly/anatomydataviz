var presentation = angular.module('presentation', []);

presentation.controller('PresentationController', function($scope, $location, keyboard) {
  var scope = $scope;
  var RIGHT_ARROW = 39;
  var LEFT_ARROW = 37;
  var PAGE_UP = 33;
  var PAGE_DOWN = 34;

  keyboard.on([RIGHT_ARROW, PAGE_DOWN], function() {
    scope.activeSlide++;
  });

  keyboard.on([LEFT_ARROW, PAGE_UP], function() {
    scope.activeSlide--;
  });

  scope.$watch('activeSlide', function(value) {
    if (value == -1) {
      $location.url('');
    } else if (value > -1) {
      $location.url('/slides/' + (value + 1));
    }
  });

  scope.$watch(function() { return $location.url(); }, function(value) {
    var match = /\/slides\/(\d+)/.exec(value);
    if (match) {
      scope.activeSlide = parseInt(match[1], 10) - 1;
    } else if (value == '/slides/end') {
      scope.activeSlide = scope.totalSlides;
    }
  });

  scope.isInsideDeck = function() {
    return !this.isBefore() && !this.isAfter();
  };

  scope.isBefore = function() {
    return scope.activeSlide < 0;
  };

  scope.isAfter = function() {
    return scope.activeSlide >= scope.totalSlides;
  };
});

presentation.factory('keyboard', function($rootScope) {
  return {
    on: function(keyCodes, callback) {
      keyCodes = angular.isArray(keyCodes) ? keyCodes : [keyCodes];

      $(window).keydown(function(e) {
        if (keyCodes.indexOf(e.keyCode) !== -1) {
          $rootScope.$apply(callback);
        }
      });
    }
  };
});

presentation.directive('deck', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      var slides = element.find('slide');
      var name = element.attr('current');
      var total = element.attr('total');

      function restack() {
        slides.each(function(i, slide) {
          slide.style.zIndex = 'auto';
          if ($(slide).hasClass('next')) {
            slide.style.zIndex = -i;
          }
        });
      }

      restack();

      scope.$eval(total + ' = ' + slides.length);

      scope.$watch(name, function(value) {
        slides.each(function(i, slide) {
          $(slide).removeClass('previous current next');
          if (i < value) {
            $(slide).addClass('previous');
          } else if (i == value) {
            $(slide).addClass('current');
          } else {
            $(slide).addClass('next');
          }
        });

        if (value < -1 || isNaN(value)) {
          scope.$eval(name + ' = -1');
        } else if (value > slides.length) {
          scope.$eval(name + ' = ' + slides.length);
        }

        restack();
      });
    }
  };
});

presentation.directive('slide', function() {
  return {
    restrict: 'E',
    compile: function(tpl, attr) {
      
      /*
      tpl.find('markdown,md')
        .each(function(i, el){
          jQuery(el)
            .replaceWith(markdown.toHTML(el.innerHTML));
        });
      */
      
      if (tpl.has('.overlay').add(tpl.has('pre')).length){
        tpl.css({backgroundImage:"none"});
      }
            
      if (!tpl.hasClass('non-center')) {
        tpl.wrapInner('<div class="center-wrapper"><div class="center-cell"></div></div>');
        tpl.addClass('center');
      }

      if(attr.title) {
        tpl.prepend('<h2 class="title">' + attr.title + '</h2>');
      }

      addPrettify();
    }
  };
});

presentation.directive('slideCode', function() {
  return {
    terminal: true,
    link: function(scope, element, attr) {
      element.addClass('brush: js; toolbar: false;');
      if (attr.slideCode !== 'js') {
        element.addClass('html-script: true;');
      }
    }
  };
});


function addPrettify() {
  jQuery('slide pre').each(function(i, pre){
    var elem = jQuery(pre);
    if (!elem.hasClass('noprettyprint')){
      elem.addClass('prettyprint');
    }
  });
  prettyPrint();
}