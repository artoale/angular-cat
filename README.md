# CAT - CSS Animation Timeline

[![Travis CI Build Status](https://travis-ci.org/artoale/angular-cat.svg)](https://travis-ci.org/artoale/angular-cat)
[![codecov.io](https://codecov.io/github/artoale/angular-cat/coverage.svg?branch=master)](https://codecov.io/github/artoale/angular-cat?branch=master)

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

## Use with angular-spy

tl;dr - If you need to run animations on scroll, have a look at
[angular-spy](https://github.com/flea89/angular-spy) which works very well with
angular-cat.

Originally, angular-cat shipped with directives to handle scroll-based triggers.
We realized though, that coordinating CSS animation and handling scroll-spies
are two, quite different things, which can be very useful both by themselves or
used together. We decided then to split the two, keep responsibility separated,
footprint smaller and allow for more flexibility.

## Components

### `cat-class` directive

Play/stop CSS based animation using a `--start` class modifier.
When the `cat-active` attribute becomes truthy the animation triggers,
by removing the `--start` suffix.

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
    cat-undo="1">I am a red text!</div>
<button ng-click="trigger = !trigger">Toggle status</button>
```

The fact that animations are defined end-to-start, makes it way easier to write CSS
for browser where you don't wont animations to run (mobile, legacy). The final status
of the animation is defined by its default style (`.a-class-name`), while the
`--start` version specifies how to set up the animation.

### `cat-delay` directive

Introduce a delay in an animation sequence. This is particularly useful when you're sharing
sub-animations and you need to fine tune delays on a per-case scenario.


### `cat-timeline` directive

Combine all its children directive and, when `cat-active` is set, runs them in
sequence (default).

This is where most of the magic happens. You can use the timeline to play a sequence
of simple animations, nest them, or run them in whatever order you want!

By default, the animations are run in sequence, and not repeated unless `cat-undo` is specified.

```html
<div cat-timeline cat-active="sequence" cat-undo="1">
    <div cat-class="animation-1"></div>
    <div cat-delay="500"></div>
    <div cat-class="animation-2"></div>
</div>
```


## APIs

All directives can be controlled both declaratively via HTML attributes, or
programmatically, by requiring their angular controller.

For most use cases, HTML attributes should be enough. You should care about the programmatic interface only if
you're writing custom directives that needs to integrate with the timeline (or if you're contributing to this project!)

### Shared HTML interface

#### `cat-active`
*Expression*

Used to trigger the animation when the expression evaluates to true. It should be used as a *write-only* scope variable by the animation directives and set from the outside (e.g. by `spy-visible`).

If you write a custom animation you should never set this variable.

#### `cat-undo`
*expression* |
Default: **false**

Tells the directive that the animation should be "cleared" (resetted) when
`cat-active` switches back to `false`. This allow to replay the animations
more then once

#### `cat-disabled`
*expression* | Default: **false**

Specify that the animation should be disabled. This can be changed dynamically
to disable animations depending on your animation status

#### `cat-animation-name`
*string* | Defaults to the directive name

Name to be used when registering the animation on the parent `cat-timeline`.

#### `cat-status`
*expression* | **readonly**

Read-only variable (written by the directives). Can be used to check the animation
status. It can assume the values of 'READY', 'RUNNING', 'SEEKING' or 'FINISHED'.

Very useful if you want to play animations only when other are finished,
but don't or can't create a "wrapper" animation for all of them.

### Directive specific HTML APIs
Not shared among all directives

#### `cat-class="<class-name>"`
Tells the directive to use `<class-name>` as CSS animation class: this will make the animation
add a `<class-name>--start` class to set-up the animation.

#### `cat-delay="<millis>"`
How long to wait, in milliseconds.

### Shared JS interface

All APIs return a promise, which is resolved when the relative action is
successfully completed, or rejected otherwise.

#### `controller.play() : Promise`
Start the animation and returns a promise, resolved when the animation is over.
If called when the animation is already running, the same promise is returned.

#### `controller.seek(progress: string) : Promise`

`progress` can be either the `'start'` or `'end'` string.

Seek to the end or the beginning of the animation, based on the passed parameter.
If called when the animation is `RUNNING` it causes the play promise to be rejected.

#### `controller.setDisabled(disabled: boolean) : Promise`

Set the disabled status of the animation.

#### `controller.setUp() : Promise`

Called by the linking function on all animation directives.
You should probably never call this yourself.

### Additional JS APIs

#### `timelineController.register(animationName: string, animationController [, order: number])`
Called by "component" directives to register themselves. The order parameter is
currently only available via JS APIs, but will be added as a shared attribute in
the future.

#### `timelineController.getAnimation(animationName: string) : animationController`

Return a registered animation by name.

#### `timelineController.getAllAnimations(): object<animationName: animationController>`

Get all animations objects registered on the timeline controller.



[![Analytics](https://ga-beacon.appspot.com/UA-39387573-2/potato-animation/readme?pixel)](https://github.com/igrigorik/ga-beacon)
