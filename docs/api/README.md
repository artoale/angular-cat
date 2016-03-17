# API Reference

All the built-in directives share a common interface, accessible both via html attributes and via a javascript interface, which can be accessed by requiring the directive controller in your own custom directive.

In this documentation we sometimes refer to attributes as **read-only** when we intend that only the directive should write these variable (not you!) and **write-only** when a variable is guaranteed to never be set by the directive, but only meant to be set by the outside (you!).

## HTML attributes

`cat-active` _expression_ | **write-only**

Used to trigger the animation when the expression evaluates to true. It should be used as a _write-only_ scope variable by the animation directives and set from the outside (e.g. by `spy-visible`).

If you write a custom animation you should never set this variable.

 `cat-undo` _expression_ | Default: `false`

Tells the directive that the animation should be "cleared" (resetted) when `cat-active` switches back to `false`. This allow to replay the animations more then once

 `cat-disabled` _expression_ | Default: `false`

Specify that the animation should be disabled. This can be changed dynamically to disable animations depending on your animation status

 `cat-animation-name` _string_ | Defaults to the directive name

Name to be used when registering the animation on the parent `cat-timeline`.

 `cat-status` _expression_ | **read-only**

Read-only variable (written by the directives). Can be used to check the animation status. It can assume the values of 'READY', 'RUNNING', 'SEEKING' or 'FINISHED'.

Very useful if you want to play animations only when other are finished, but don't or can't create a "wrapper" animation for all of them.

## Animation JS interface

All APIs return a promise, which is resolved when the relative action is successfully completed, or rejected otherwise.

To get an instance of the animation controller you can either require it directly in your own directives or use `timeline` specific functions if you are writing a custom timeline.

`controller.play() : Promise`

Start the animation and returns a promise, resolved when the animation is over. If called when the animation is already running, the same promise is returned.

`controller.seek(progress: string) : Promise`

Argument `progress` can be either the `'start'` or `'end'` string.

Seek to the end or the beginning of the animation, based on the passed parameter. If called when the animation is `RUNNING` it causes the play promise to be rejected.

`controller.setDisabled(disabled: boolean) : Promise`

Set the disabled status of the animation.

`controller.setUp() : Promise`

Called by the linking function on all animation directives to notify the controller that the animation is ready. You should probably never need to call this yourself.
