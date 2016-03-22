# Services documentation

This document describes the injectable services provided by angular-cat.

These services are mostly for usage when implementing custom animations.

## catDelayS

`catDelayS(millis: number): Promise`

Utility function that returns a `$q` promise resolved after `millis` milliseconds, similar to `Q.delay`

## catBaseAnimation

Used internally by all our directives controller.

It handles managing the internal state of the animation and greatly reduce the complexity of writing custom animations. It returns all the function defined by the shared js API and allow each of those to be customized.

When creating an instance of the base animation, make sure to pass along the $scope and $attrs injectable.

### Usage example

Inside a directive definition:

```javascript
// ...
controller: function DirectiveController($scope, $attrs) {
  let baseAnimation = catBaseAnimation({
    // Define one or more custom handlers
    onSetUp: function () {...},
    onPlay: function() {...}
    // ...
    $scope: $scope,
    $attrs: $attrs
  });

  // Copy all function so that those are exposed on our controller
  angular.extend(this, baseAnimation);

  // same as
  // this.setUp = baseAnimation.setUp;
  // this.seek = baseAnimation.seek;
  // this.play = baseAnimation.play;
  // this.setDisabled = baseAnimation.setDisabled;
}
// ...
```

`catBaseAnimation(config: object) : animationApi`

The `config` object allows to customize the behavior of the animation. All its properties should be function optionally returning a promise, resolved when the respective action is completed. All properties are optional.

`config.onSetup()`

Called during directive linking phase. All other API call wait on this promise before executing - which means you can use it to do any synchronous or asynchronous setup task (e.g. you could preload a video to make sure it's ready when running an animation).

`config.onPlay()`

Called to actually play the animation. This is where most of the magic happens. It's called by baseAnimation to trigger animation playback and any custom animation implementation should implement this function and make sure to return a promise resolved when the animation is finished.

`config.onSeek(progress: string)`

Called when seeking to either the end or beginning of an animation. `progress` can be either the string `'end'` or `'start'`. Be aware that seek is called by base animation in many different scenarios depending on the current animation state - and thus it should have immediate visual result (e.g. in a CSS based transition, `element.style.transition` should be set to `'none'` to avoid visual glitches)

`config.disable()`

This is called to notify that an animation status will change to `DISABLED`. Most of the time, you don't need to implement this, unless you need some visual effect that shows the animation is running.

## catAnimationLink

This function should be called with all your linking function arguments inside it. It takes care of watching the correct _shared_ html attributes, registering on (if any) parent timeline controller and calling the controller `setUp` function.
