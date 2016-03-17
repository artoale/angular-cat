# Directives documentation

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

## catDelay

### Usage example

Animations that just waits for the given time in milliseconds.

This directive, practically useless on it's own, is very powerful and useful when dealing with complex animation since it allows to introduce delays declaratively. It allows to keep delays outside of CSS transitions and animations, making them much more reusable.

```html
<div cat-delay="3000"></div>
```
