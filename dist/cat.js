(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.animations.animationLink', []);

mod.factory('catAnimationLink', function () {
    return function (scope, element, attrs, controllers) {
        var selfController = controllers[0],
            timelineController = controllers[1],
            animationName = attrs.catAnimationName;

        selfController.setUp();

        if (timelineController) {
            timelineController.register(animationName, selfController);
        }

        if (angular.isDefined(attrs.catDisabled)) {
            scope.$watch(attrs.catDisabled, function (newVal) {
                if (typeof newVal === 'boolean') {
                    selfController.setDisabled(newVal);
                }
            });
        }

        if (angular.isDefined(attrs.catActive)) {
            scope.$watch(attrs.catActive, function (newVal) {
                if (newVal) {
                    selfController.play();
                } else if (attrs.catUndo) {
                    selfController.seek('start');
                }
            });
        }
    };
});

exports.default = mod;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _animationLink = require('./animation-link.factory');

var _animationLink2 = _interopRequireDefault(_animationLink);

var _baseAnimation = require('./base-animation.factory');

var _baseAnimation2 = _interopRequireDefault(_baseAnimation);

var _class = require('./class.directive');

var _class2 = _interopRequireDefault(_class);

var _delay = require('./delay.directive');

var _delay2 = _interopRequireDefault(_delay);

var _timeline = require('./timeline.directive');

var _timeline2 = _interopRequireDefault(_timeline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _module = angular.module('cat.animations', ['ngAnimate', _animationLink2.default.name, _baseAnimation2.default.name, _class2.default.name, _delay2.default.name, _timeline2.default.name]);

exports.default = _module;

},{"./animation-link.factory":1,"./base-animation.factory":3,"./class.directive":4,"./delay.directive":5,"./timeline.directive":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.animations.baseAnimation', []);

mod.factory('catBaseAnimation', ['$q', '$parse', function ($q, $parse) {
    return function (config) {
        var statusScopeVar = undefined,
            setupDeferred = $q.defer(),
            playDeferred = $q.defer(),
            status = '',
            isDisabled = false,
            statusSetter = function statusSetter(newStatus) {
            return function () {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign(config.$scope, newStatus);
                }
                status = newStatus;
            };
        },
            running = statusSetter('RUNNING'),
            seeking = statusSetter('SEEKING'),
            ready = statusSetter('READY'),
            finished = statusSetter('FINISHED'),
            waitForSetup = function waitForSetup(fn) {
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return setupDeferred.promise.then(fn.bind.apply(fn, [null].concat(args)));
            };
        },
            seek = function seek(progress) {
            var onSeeked = progress === 'end' ? finished : ready;
            if (status === 'RUNNING') {
                playDeferred.reject(); // Maybe reject?
            }
            seeking();
            return $q.when(config.onSeek(progress)).then(onSeeked);
        },
            play = function play() {
            if (status === 'READY' && !isDisabled) {
                playDeferred = $q.defer();
                running();

                playDeferred.promise.then(finished);

                $q.when(config.onPlay()).then(playDeferred.resolve, playDeferred.reject);
            } else if (isDisabled) {
                seek('end');
            }
            return playDeferred.promise;
        },
            setDisabled = function setDisabled(newIsDisabled) {
            isDisabled = newIsDisabled;

            if (newIsDisabled) {
                if (status === 'READY') {
                    seek('start');
                } else {
                    seek('end');
                }
            }
            return $q.when(config.disable(newIsDisabled));
        },
            setUp = function setUp() {
            $q.when(config.onSetUp()).then(ready).then(setupDeferred.resolve, setupDeferred.reject);
            return setupDeferred.promise;
        };

        if (config.$attrs && config.$attrs.catStatus) {
            statusScopeVar = config.$attrs.catStatus;
        }

        ['onPlay', 'onSetUp', 'disable', 'onSeek'].forEach(function (fun) {
            config[fun] = typeof config[fun] === 'function' ? config[fun] : angular.noop;
        });

        return {
            play: waitForSetup(play),
            seek: waitForSetup(seek),
            setDisabled: waitForSetup(setDisabled),
            setUp: setUp,
            get status() {
                return status;
            },
            get isDisabled() {
                return isDisabled;
            }
        };
    };
}]);

exports.default = mod;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.animations.class', []),
    directiveName = 'catClass';

mod.directive(directiveName, ['$animate', '$parse', '$timeout', 'catAnimationLink', 'catBaseAnimation', function ($animate, $parse, $timeout, catAnimationLink, catBaseAnimation) {
    return {
        restrict: 'A',
        require: [directiveName, '^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            var className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start';

            var seek = function seek(progress) {
                $element.css({
                    transition: 'none'
                });
                if (progress === 'end') {
                    $element.removeClass(classNameStart);
                } else if (progress === 'start') {
                    $element.addClass(classNameStart);
                }
                // Force relayout
                $element[0].offsetHeight; //jshint ignore:line
                $element.css({
                    transition: ''
                });
            };

            var baseAnimation = catBaseAnimation({
                $scope: $scope,
                $attrs: $attrs,
                onSeek: seek,
                onPlay: function onPlay() {
                    return $animate.removeClass($element, classNameStart);
                },
                onSetUp: function onSetUp() {
                    if (!$element.hasClass(className)) {
                        $element.addClass(className);
                    }

                    seek('start');
                }
            });

            //APIs used by linking function
            this.setUp = baseAnimation.setUp;

            //Public APIs
            this.play = baseAnimation.play;
            this.seek = baseAnimation.seek;
            this.setDisabled = baseAnimation.setDisabled;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports.default = mod;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.animations.delay', []),
    directiveName = 'catDelay';

mod.directive(directiveName, ['$parse', 'catDelayS', 'catAnimationLink', 'catBaseAnimation', function ($parse, catDelayS, catAnimationLink, catBaseAnimation) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var millis = parseInt($attrs[directiveName], 10) || 1000;

            var baseAnimation = catBaseAnimation({
                $scope: $scope,
                $attrs: $attrs,
                onPlay: function onPlay() {
                    return catDelayS(millis);
                }
            });

            //APIs used by linking function
            this.setUp = baseAnimation.setUp;
            //Public APIs
            this.seek = baseAnimation.seek;
            this.play = baseAnimation.play;
            this.setDisabled = baseAnimation.setDisabled;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports.default = mod;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.animations.timeline', []),
    directiveName = 'catTimeline';

mod.directive(directiveName, ['$parse', 'catAnimationLink', 'catBaseAnimation', function ($parse, catAnimationLink, catBaseAnimation) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var animations = [],
                runAnimation = function runAnimation(promise) {
                var ordered = animations.slice().sort(function (a, b) {
                    var delta = a.order - b.order;
                    return delta ? delta : a.pushOrder - b.pushOrder;
                });

                return ordered.reduce(function (prev, curr) {
                    return prev.then(curr.controller.play);
                }, promise);
            },
                animationsMap = {},
                baseAnimation = catBaseAnimation({
                onPlay: function onPlay() {
                    return runAnimation($q.when());
                },
                disable: function disable(isDisabled) {
                    animations.forEach(function (animation) {
                        animation.controller.setDisabled(isDisabled);
                    });
                },
                onSeek: function onSeek(progress) {
                    return animations.forEach(function (animation) {
                        return animation.controller.seek(progress);
                    });
                },
                $scope: $scope,
                $attrs: $attrs
            }),
                register = function register(name, controller) {
                var order = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                animations.push({
                    name: name,
                    controller: controller,
                    order: order,
                    pushOrder: animations.length
                });
                animationsMap[name] = controller;
                controller.setDisabled(baseAnimation.isDisabled);
                if (baseAnimation.status && baseAnimation.status !== 'READY') {
                    controller.seek('end');
                }
            },
                setCustomAnimation = function setCustomAnimation(customRunAnimation) {
                runAnimation = customRunAnimation;
            },
                getAnimation = function getAnimation(animationName) {
                return animationsMap[animationName];
            },
                getAllAnimations = function getAllAnimations() {
                return animationsMap;
            };

            //Public APIs

            //Router specific
            this.getAllAnimations = getAllAnimations;
            this.getAnimation = getAnimation;
            this.register = register;
            this.setCustomAnimation = setCustomAnimation;

            //Animation specific
            this.play = baseAnimation.play;
            this.seek = baseAnimation.seek;
            this.setDisabled = baseAnimation.setDisabled;
            this.setUp = baseAnimation.setUp;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports.default = mod;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scrollSpy = require('./scroll-spy/scroll-spy.module');

var _scrollSpy2 = _interopRequireDefault(_scrollSpy);

var _animations = require('./animations/animations.module');

var _animations2 = _interopRequireDefault(_animations);

var _delay = require('./utils/delay.service');

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _module = angular.module('cat', ['ngAnimate', _animations2.default.name, _delay2.default.name, _scrollSpy2.default.name]);

exports.default = _module;

},{"./animations/animations.module":2,"./scroll-spy/scroll-spy.module":9,"./utils/delay.service":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debounce = require('../utils/debounce.service');

var _debounce2 = _interopRequireDefault(_debounce);

var _windowScrollHelper = require('../utils/window-scroll-helper.service');

var _windowScrollHelper2 = _interopRequireDefault(_windowScrollHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mod = angular.module('cat.scrollSpy.scrollContainer', [_debounce2.default.name, _windowScrollHelper2.default.name]);

mod.directive('catScrollContainer', ['$window', '$timeout', 'catDebounce', 'windowScrollGetter', function ($window, $timeout, catDebounce, windowScrollGetter) {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', function ($scope, $element) {
            var _this = this;

            this.spies = [];
            this.registerSpy = function (spy) {
                _this.spies.push(spy);
            };

            this.getScrollContainer = function () {
                return $element[0];
            };
        }],
        link: function link(scope, elem, attrs, selfCtrl) {
            var afTimeout = 400;
            var vpHeight = undefined,
                $aWindow = angular.element($window),
                $scrollTopReference = elem[0].tagName === 'BODY' ? windowScrollGetter() : elem,
                $scroller = elem[0].tagName === 'BODY' ? $aWindow : elem,
                animationFrame = undefined,
                lastScrollTimestamp = 0,
                scrollPrevTimestamp = 0,
                previousScrollTop = 0;

            function onScroll() {
                lastScrollTimestamp = $window.performance.now();
                if (!animationFrame) {
                    animationFrame = $window.requestAnimationFrame(onAnimationFrame);
                }
                scrollPrevTimestamp = $window.performance.now();
            }

            function onResize() {
                vpHeight = Math.max($window.document.documentElement.clientHeight, window.innerHeight || 0);
                selfCtrl.spies.forEach(function (spy) {
                    spy.updateClientRect();
                });
                onScroll();
            }

            function onAnimationFrame() {
                var viewportRect = getViewportRect(),
                    timestamp = $window.performance.now(),
                    delta = timestamp - scrollPrevTimestamp,
                    scrollDelta = viewportRect.top - previousScrollTop,
                    scrollDirection = scrollDelta === 0 ? 0 : scrollDelta / Math.abs(scrollDelta);

                selfCtrl.spies.forEach(function (spy) {
                    spy.update(viewportRect, scrollDirection);
                });

                previousScrollTop = viewportRect.top;

                if (delta < afTimeout) {
                    queueAf();
                } else {
                    cancelAf();
                }
            }

            function getViewportRect() {
                var currentScroll = $scrollTopReference[0].scrollTop;
                return {
                    top: currentScroll,
                    height: vpHeight
                };
            }

            function queueAf() {
                animationFrame = $window.requestAnimationFrame(onAnimationFrame);
            }

            function cancelAf() {
                $window.cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            scope.$on('catScrollContainer:updateSpies', onResize);

            if (angular.isDefined(attrs.triggerUpdate)) {
                scope.$watch(attrs.triggerUpdate, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout(function () {
                            onResize();
                        }, 0);
                    }
                });
            }

            $aWindow.on('resize', catDebounce(onResize, 300));
            $scroller.on('scroll', onScroll);
            $timeout(onResize);
        }
    };
}]);

exports.default = mod;

},{"../utils/debounce.service":11,"../utils/window-scroll-helper.service":13}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scrollContainer = require('./scroll-container.directive');

var _scrollContainer2 = _interopRequireDefault(_scrollContainer);

var _visible = require('./visible.directive');

var _visible2 = _interopRequireDefault(_visible);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mod = angular.module('cat.scrollSpy', [_scrollContainer2.default.name, _visible2.default.name]);

//TODO: The current implementation works for scroll spies on the
// body element and for scroll divs when no parents are scrollable.
// The case where we have nested scroll elements has to be investigated.

exports.default = mod;

},{"./scroll-container.directive":8,"./visible.directive":10}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.scrollSpy.visible', []);

mod.directive('catVisible', ['$window', '$parse', '$timeout', function ($window, $parse, $timeout) {
    return {
        restrict: 'A',
        require: '^^catScrollContainer',
        link: function link(scope, elem, attrs, ctrl) {
            var rect = {},
                hidden = false,
                scrollContainer = undefined,
                api = {
                updateClientRect: function updateClientRect() {
                    var clientRect = elem[0].getBoundingClientRect();
                    rect.top = clientRect.top + scrollContainer.scrollTop;
                    rect.left = clientRect.left + scrollContainer.scrollLeft;
                    rect.width = clientRect.width;
                    rect.height = clientRect.height;
                    hidden = elem[0].offsetParent === null;
                },
                update: function update(viewportRect) {
                    var isFullyVisible = rect.top >= viewportRect.top && //Top border in viewport
                    rect.top + rect.height <= viewportRect.top + viewportRect.height || //Bottom border in viewport
                    rect.top <= viewportRect.top && rect.top + rect.height >= viewportRect.top + viewportRect.height,
                        // Bigger than viewport

                    isFullyHidden = !isFullyVisible && rect.top > viewportRect.top + viewportRect.height || //Top border below viewport bottom
                    rect.top + rect.height < viewportRect.top; //Bottom border above viewport top

                    //Only change state when fully visible/hidden
                    if (isFullyVisible) {
                        api.setInView(true);
                    } else if (isFullyHidden) {
                        api.setInView(false);
                    }
                },
                getRect: function getRect() {
                    return rect;
                },
                setInView: function setInView(inView) {
                    if ($parse(attrs.catVisible)(scope) !== inView && !hidden) {
                        scope.$evalAsync(function () {
                            var catVisibleSetter = $parse(attrs.catVisible);
                            catVisibleSetter.assign(scope, inView);
                        });
                    }
                }
            };
            if (angular.isDefined(attrs.triggerUpdate)) {
                scope.$watch(attrs.triggerUpdate, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout(function () {
                            api.updateClientRect();
                            api.update();
                        }, 0);
                    }
                });
            }

            scrollContainer = ctrl.getScrollContainer() || $window.document.body;
            ctrl.registerSpy(api);
            api.updateClientRect();
        }
    };
}]);

exports.default = mod;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.utils.debounce', []);

mod.factory('catDebounce', ['$timeout', '$q', function ($timeout, $q) {
    return function (func, wait, immediate) {
        var timeout = undefined,
            deferred = $q.defer();

        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var context = undefined,
                later = function later() {
                timeout = null;
                if (!immediate) {
                    deferred.resolve(func.apply(context, args));
                    deferred = $q.defer();
                }
            },
                callNow = immediate && !timeout;
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);
            if (callNow) {
                deferred.resolve(func.apply(context, args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
}]);

exports.default = mod;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.utils.delay', []);

mod.factory('catDelayS', ['$timeout', '$q', function ($timeout, $q) {
    return function (millis) {
        var deferred = $q.defer();
        $timeout(deferred.resolve.bind(deferred, millis), millis);
        return deferred.promise;
    };
}]);

exports.default = mod;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mod = angular.module('cat.utils.windowScrollHelper', []);

mod.factory('windowScrollGetter', ['$window', function ($window) {
    return function () {
        var docEl = $window.document.documentElement;
        var scrollContainer = undefined;

        docEl.scrollTop = 1;

        if (docEl.scrollTop === 1) {
            docEl.scrollTop = 0;
            scrollContainer = docEl;
        } else {
            scrollContainer = $window.document.body;
        }

        return angular.element(scrollContainer);
    };
}]);

exports.default = mod;

},{}]},{},[7])
//# sourceMappingURL=cat.js.map
