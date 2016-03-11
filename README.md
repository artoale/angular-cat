# CAT - CSS Animation Timeline

[![Travis CI Build Status](https://travis-ci.org/artoale/angular-cat.svg)](https://travis-ci.org/artoale/angular-cat)

Set of AngularJS directives to simplify development and composition of
animations on static websites.

## Why
Most modern "static" websites, have loads of complicated animations, often built
out of smaller bits.
You need to sequence CSS transition, CSS animations and custom javascript stuff, manage
scroll-based trigger, make those repeatable.

You don't wont to stick all this complexity in a controller which not only shouldn't be there just because of animations,
you'll also end up having code duplication and find yourself in a code maintenance hell.

## The solution

A set of
* Declarative
* Reusable
* Composable
* Nestable

AngularJS directives!

## Components

### cat-scroll-container and cat-visible directives
Detect when an element is fully visible (and fully hidden) in page, and sets
a scope variable accordingly

```html
<body cat-scroll-container>
    [...]
    <div cat-visible="runAnimation">
        When I'm visible, `runAnimation` is set to true
    </div>
    [...]
</body>
```
At the moment, these work only when there are no "nested" scrolling container.

### cat-class directive

Play/stop CSS based animation using a `--start` class modifier.


```html
<style>
    .a-class-name {
        color: red;
        transition: color 1s linear;
    }

    .a-class-name--start {
        color: blue;
        transition: none;
    }
</style>
<div cat-class="a-class-name"
    cat-active="trigger"
    cat-undo="1">I am a red text!</div>
<button ng-click="trigger = !trigger">Toggle status</button>
```

The fact that animations are defined "backward", makes it way easier to write CSS
for browser where you don't wont animations to run (mobile, legacy). The final status
of the animation is defined by its default style (`.a-class-name`), while the
`--start` version specifies how to set up the animation.

Note that we use `transition: none` to avoid running the transition "backward", when resetting it (but we could, if we wanted to!)

### cat-delay directive

Introduce a delay in an animation sequence. This is particularly useful when you're sharing
sub-animations and you need to fine tune delays on a per-case scenario.


### cat-timeline directive

Combine all its children directive and, (if `cat-active` is set) runs them in
sequence.

This is where most of the magic happens. You can use the timeline to play a sequence
of simple animations, nest them, or run them in whatever order you want!

By default, the animations are run in sequence, and not repeated unless `cat-undo` is specified.

```html
<div cat-timeline cat-active="sequence" cat-undo="1">
    <div cat-class="animation-1"></div>
    <div cat-delay="500"></div>
    <div cat-class="animation-2"> </div>
</div>
```


## APIs

All directives can be controlled both declarative, via HTML attributes, or
programmatically, by requiring their angular controller.

For most use cases, HTML attributes should be enough. You should care about the programmatic interface only if
you're writing custom directives that needs to integrate with the timeline (or if you're contributing to this project!)

### Shared HTML interface

#### `cat-active`
Used to trigger the animation when changes to true. It should be used as a "read only" scope variable by the animation directives and set from the outside (e.g. by `cat-visible`).

#### `cat-undo`
Default: **false**

Tells the directive that the animation should be "cleared" (resetted) when `cat-active` switches back to `false`

#### `cat-animation-name`
Defaults to the directive name

Name to be used when registering the animation on the parent `cat-timeline`.

#### `cat-status`
Read-only variable (written by the directives). Can be used to check the animation
status. Can be 'READY', 'RUNNING', 'CLEARING' or 'FINISHED'. Very useful if you want to
play animations only when other are finished, but don't or can't create a "global" animation for all of them.


### Additional HTML APIs
Not shared among all directives

#### `cat-class="<class-name>"`
Tells the directive to use `<class-name>` as CSS animation class: this will make the animation
add a `<class-name>--start` class to set-up the animation.

#### `cat-delay="<millis>"`
How long to wait, in milliseconds.


### Shared JS interface

### `controller.play() : Promise`
Start the animation and returns a promise, resolved when the animation is over.
If called when the animation is already running, the same promise is returned.

### `controller.clear() : Promise`
Reset the animation to its initial state, returning a promise resolved when the
clearing operation is finished.

#### Additional JS APIs

### `timelineController.register(animationName: string, animationController [, order: number])`
Called by "component" directives to register themselves. The order parameter is
currently only available via JS APIs, but will be added as a shared attribute in
the future.

### `timelineController.get()` //TODO
Not implemented yet, should allow to get a children animation from the controller
for custom animation ordering and sequencing (e.g. first two in parralle, than the third, than another two...)


[![Analytics](https://ga-beacon.appspot.com/UA-39387573-2/potato-animation/readme?pixel)](https://github.com/igrigorik/ga-beacon)
