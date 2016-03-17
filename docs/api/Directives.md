# Directives documentation

Here you can find directives specific APIs and description. Bear in mind that all directives share a common HTML and JS API, described [here](./README.md).

## catClass

Trigger CSS animation playback.

It works by adding a class on setup and then removing it when `cat-active` expression evaluates to true. The class is constructed by adding the `--start` suffix to the `cat-class` attribute value.

As you can see, animation are written inside-out to make it easy to support browser where you don't want to run animations (mobile, legacy) or even when javascript is disabled (in which case you won't have any animation, but the final state will be there).

### Usage example

```html
<style>
    .a-class-name {
        color: red;
        transition: color 1s linear;
    }

    .a-class-name--start {
        color: blue;
    }
</style>


<div cat-class="a-class-name"
     cat-active="trigger"
     cat-undo="true">I am a red text!</div>
<button ng-click="trigger = !trigger">Toggle status</button>
```

### Additional HTML APIs

#### `cat-class` attribute

Specifies the class which defines the animation. Note that the directive automatically adds this class to the element `classList` so you won't need to add it unless you need to support browser with no javascript.

--------------------------------------------------------------------------------

## catTimeline

Combine all its children directives and runs them in sequence.

This is where most of the magic happens. All anglar-cat directives register themselves on the first parent `cat-timeline` (if any). The timeline supports basic sequence animation by default, but you can customize it easily.

Please note that `cat-timeline` is an animation itself, meaning that you can nest them as much as you want, to build up complex sequences from simple ones.

### Usage example

```html
<div cat-timeline cat-active="sequence" cat-undo="1">
    <div cat-class="animation-1"></div>
    <div cat-delay="500"></div>
    <div cat-class="animation-2"></div>
</div>
```

### Additional JS APIs

#### `timelineController.register(animationName: string, animationController [, order: number])`

Called by "component" directives to register themselves. The order parameter is currently only available via JS APIs, but we plan on adding it in a future release.

#### `timelineController.getAnimation(animationName: string) : animationController`

Return a registered animation by name.

#### `timelineController.getAllAnimations(): object<animationName: animationController>`

Get all animations controller registered on the timeline controller. Returns an object hash with the animation name as key, the controller as value.

#### `timelineController.setCustomAnimation(customRunAnimation: fn)`

Specify a custom function for running the animation.

The function is passed a promise to wait on and should return a promise resolved when the compound animation is finished. See the `cat-timeline` demo for an example of how to write custom animation timelines.

--------------------------------------------------------------------------------

## catDelay

Animations that just waits for the given time in milliseconds.

### Usage example

This directive, practically useless on its own, is very powerful and useful when dealing with complex animation since it allows to introduce delays declaratively. It allows to keep delays outside of CSS transitions and animations, making them much more reusable.

Delay specified in milliseconds.

```html
<div cat-delay="3000"></div>
```
