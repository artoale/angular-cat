(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('cat.animations.animationLink', []);

mod.factory('catAnimationLink', function () {
    return function (scope, element, attrs, controllers) {
        var selfController = controllers[0],
            timelineController = controllers[1],
            animationName = attrs.catAnimationName;

        if (timelineController) {
            timelineController.register(animationName, selfController);
        }

        selfController.setUp();

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
                    selfController.clear();
                }
            });
        }
    };
});

exports['default'] = mod;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classDirective = require('./class.directive');

var _classDirective2 = _interopRequireDefault(_classDirective);

var _delayDirective = require('./delay.directive');

var _delayDirective2 = _interopRequireDefault(_delayDirective);

var _timelineDirective = require('./timeline.directive');

var _timelineDirective2 = _interopRequireDefault(_timelineDirective);

var _animationLinkFactory = require('./animation-link.factory');

var _animationLinkFactory2 = _interopRequireDefault(_animationLinkFactory);

var _module = angular.module('cat.animations', ['ngAnimate', _classDirective2['default'].name, _delayDirective2['default'].name, _timelineDirective2['default'].name, _animationLinkFactory2['default'].name]);

exports['default'] = _module;
module.exports = exports['default'];

},{"./animation-link.factory":1,"./class.directive":3,"./delay.directive":4,"./timeline.directive":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('cat.animations.class', []),
    directiveName = 'catClass';

mod.directive(directiveName, ['$animate', '$parse', 'catAnimationLink', function ($animate, $parse, catAnimationLink) {
    return {
        restrict: 'A',
        require: [directiveName, '^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            var className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                statusScopeVar = $attrs.catStatus;

            var status = '',
                deferred = $q.defer(),
                resolve = function resolve() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return deferred && deferred.resolve(args);
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                setUp = function setUp() {
                // FIXME: do we need to have a different state when an animation
                // is disabled?
                setStatus('READY');
                if (!$element.hasClass(className)) {
                    $element.addClass(className);
                }
                $element.css({
                    transition: 'none'
                });

                $element[0].classList.add(classNameStart);

                setTimeout(function () {
                    return $element.css({
                        transition: ''
                    });
                }, 0);
            },
                clear = function clear() {
                var clearDeferred = $q.defer();
                clearDeferred.resolve();

                if (status === 'RUNNING') {
                    //TODO we might want to reject this to handle this
                    //usecase, needs more cowbell
                    resolve();
                }
                setUp();

                return clearDeferred.promise;
            },
                runAnimation = function runAnimation() {
                setStatus('RUNNING');

                $animate.removeClass($element, classNameStart).then(function () {
                    if (status === 'RUNNING') {
                        setStatus('FINISHED');
                        resolve();
                    }
                });
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    runAnimation();
                }
                return deferred.promise;
            },
                seek = function seek(progress) {
                $element.css({
                    transition: 'none'
                });
                if (progress === 'end') {
                    $element.removeClass(classNameStart);
                } else if (progress === 'start') {
                    $element.addClass(classNameStart);
                }
                $element.css({
                    transition: ''
                });
            },
                setDisabled = function setDisabled(isDisabled) {
                if (status === 'READY') {
                    if (isDisabled) {
                        seek('end');
                        setStatus('FINISHED');
                    } else {
                        seek('start');
                    }
                }
            };

            //APIs used by linking function
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.setUp = setUp;
            this.setDisabled = setDisabled;
            this.play = play;
            this.clear = clear;
            this.seek = seek;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('cat.animations.delay', []),
    directiveName = 'catDelay';

mod.directive(directiveName, ['$parse', 'catDelayS', 'catAnimationLink', function ($parse, catDelayS, catAnimationLink) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var millis = parseInt($attrs[directiveName], 10) || 1000,
                statusScopeVar = $attrs.catStatus;
            var isDisabled = false;

            var status = '',
                deferred = $q.defer(),
                resolve = function resolve() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return deferred && deferred.resolve(args);
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                setUp = function setUp() {
                setStatus('READY');
            },
                clear = function clear() {
                var clearDeferred = $q.defer();
                clearDeferred.resolve();

                if (status === 'RUNNING') {
                    resolve();
                }
                setUp();

                return clearDeferred.promise;
            },
                runAnimation = function runAnimation() {
                setStatus('RUNNING');
                return catDelayS(millis).then(function () {
                    if (status === 'RUNNING') {
                        setStatus('FINISHED');
                        resolve();
                    }
                });
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    if (isDisabled) {
                        setStatus('FINISHED');
                        resolve();
                    } else {
                        runAnimation();
                    }
                }
                return deferred.promise;
            },
                setDisabled = function setDisabled(newIsDisabled) {
                isDisabled = newIsDisabled;
                setStatus('FINISHED');
            };

            //APIs used by linking function
            this.setUp = setUp;
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.setDisabled = setDisabled;
            this.clear = clear;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('cat.animations.timeline', []),
    directiveName = 'catTimeline';

mod.directive(directiveName, ['$parse', 'catAnimationLink', function ($parse, catAnimationLink) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?catTimeline'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var statusScopeVar = $attrs.catStatus;
            var isDisabled = false;

            var animations = [],
                customAnimationQueue = undefined,
                animationsMap = {},
                deferred = $q.defer(),
                status = '',
                register = function register(name, controller) {
                var order = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                animations.push({
                    name: name,
                    controller: controller,
                    order: order,
                    pushOrder: animations.length
                });
                animationsMap[name] = controller;
                controller.setDisabled(isDisabled);
                if (status && status !== 'READY') {
                    controller.seek('end');
                }
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                clear = function clear() {
                if (status === 'RUNNING') {
                    deferred.resolve();
                }

                setStatus('CLEARING');

                return $q.all(animations.map(function (animation) {
                    return animation.controller.clear();
                })).then(function () {
                    setStatus('READY');
                });
            },
                setUp = function setUp() {
                setStatus('READY');
            },
                runAnimation = function runAnimation() {
                var animationPromise = undefined,
                    ordered = animations.slice().sort(function (a, b) {
                    var delta = a.order - b.order;
                    return delta ? delta : a.pushOrder - b.pushOrder;
                }),
                    initDeferred = $q.defer();

                setStatus('RUNNING');
                initDeferred.resolve();

                if (!customAnimationQueue) {
                    //Used for init purposes only.
                    animationPromise = ordered.reduce(function (prev, curr) {
                        return prev.then(
                        //Prevent animation to run if cleared
                        function () {
                            return status === 'RUNNING' ? curr.controller.play() : prev;
                        });
                    }, initDeferred.promise).then(setStatus.bind(undefined, 'FINISHED'));
                } else {
                    animationPromise = customAnimationQueue(initDeferred.promise).then(setStatus.bind(undefined, 'FINISHED'));
                }

                return animationPromise;
            },
                setCustomAnimation = function setCustomAnimation(animationQueue) {
                customAnimationQueue = animationQueue;
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    runAnimation().then(deferred.resolve.bind(deferred));
                }
                return deferred.promise;
            },
                getAnimation = function getAnimation(animationName) {
                return animationsMap[animationName];
            },
                getAllAnimations = function getAllAnimations() {
                return animationsMap;
            },
                setDisabled = function setDisabled(nVal) {
                isDisabled = nVal;
                if (status === 'READY') {
                    animations.forEach(function (animation) {
                        animation.controller.setDisabled(isDisabled);
                    });
                    if (nVal) {
                        setStatus('FINISHED');
                    }
                }
            },
                seek = function seek(progress) {
                animations.forEach(function (animation) {
                    animation.controller.seek(progress);
                });
            };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.setDisabled = setDisabled;

            //Public APIs
            this.play = play;
            this.clear = clear;
            this.seek = seek;
            this.register = register;
            this.getAnimation = getAnimation;
            this.getAllAnimations = getAllAnimations;
            this.setCustomAnimation = setCustomAnimation;
        }],
        link: function link() {
            return catAnimationLink.apply(undefined, arguments);
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _scrollSpyScrollSpyModule = require('./scroll-spy/scroll-spy.module');

var _scrollSpyScrollSpyModule2 = _interopRequireDefault(_scrollSpyScrollSpyModule);

var _animationsAnimationsModule = require('./animations/animations.module');

var _animationsAnimationsModule2 = _interopRequireDefault(_animationsAnimationsModule);

var _utilsDelayService = require('./utils/delay.service');

var _utilsDelayService2 = _interopRequireDefault(_utilsDelayService);

var _module = angular.module('cat', ['ngAnimate', _animationsAnimationsModule2['default'].name, _utilsDelayService2['default'].name, _scrollSpyScrollSpyModule2['default'].name]);

exports['default'] = _module;
module.exports = exports['default'];

},{"./animations/animations.module":2,"./scroll-spy/scroll-spy.module":8,"./utils/delay.service":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsDebounceService = require('../utils/debounce.service');

var _utilsDebounceService2 = _interopRequireDefault(_utilsDebounceService);

var _utilsWindowScrollHelperService = require('../utils/window-scroll-helper.service');

var _utilsWindowScrollHelperService2 = _interopRequireDefault(_utilsWindowScrollHelperService);

var mod = angular.module('cat.scrollSpy.scrollContainer', [_utilsDebounceService2['default'].name, _utilsWindowScrollHelperService2['default'].name]);

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

exports['default'] = mod;
module.exports = exports['default'];

},{"../utils/debounce.service":10,"../utils/window-scroll-helper.service":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _scrollContainerDirective = require('./scroll-container.directive');

var _scrollContainerDirective2 = _interopRequireDefault(_scrollContainerDirective);

var _visibleDirective = require('./visible.directive');

var _visibleDirective2 = _interopRequireDefault(_visibleDirective);

var mod = angular.module('cat.scrollSpy', [_scrollContainerDirective2['default'].name, _visibleDirective2['default'].name]);

//TODO: The current implementation works for scroll spies on the
// body element and for scroll divs when no parents are scrollable.
// The case where we have nested scroll elements has to be investigated.

exports['default'] = mod;
module.exports = exports['default'];

},{"./scroll-container.directive":7,"./visible.directive":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
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

exports['default'] = mod;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
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

exports['default'] = mod;
module.exports = exports['default'];

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
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

exports['default'] = mod;
module.exports = exports['default'];

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
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

exports['default'] = mod;
module.exports = exports['default'];

},{}]},{},[6])
//# sourceMappingURL=cat.js.map
